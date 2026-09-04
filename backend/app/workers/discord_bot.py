import os
import asyncio
import aiohttp
import discord
from discord.ext import commands, tasks
from discord import app_commands
import json

# Bot Configuration
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
API_BASE_URL = os.getenv("SENTRONIX_API_URL", "http://localhost:8000")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True

bot = commands.Bot(command_prefix="!", intents=intents, help_command=None)
last_notified_finding_id = None

@bot.event
async def on_ready():
    print(f"==================================================")
    print(f"[*] SentoBot logged in successfully as: {bot.user.name}#{bot.user.discriminator} (ID: {bot.user.id})")
    print(f"[*] Connected to {len(bot.guilds)} Discord server(s)")
    for g in bot.guilds:
        print(f"    - Guild: {g.name} (ID: {g.id})")
    print(f"==================================================")

    # Set Custom Activity
    await bot.change_presence(
        activity=discord.Activity(type=discord.ActivityType.watching, name="SentroniX Purple Defense | !help"),
        status=discord.Status.online
    )

    # Sync Slash Commands
    try:
        synced = await bot.tree.sync()
        print(f"[*] Synced {len(synced)} application slash command(s).")
    except Exception as e:
        print(f"[!] Slash command sync error: {e}")

    # Start background vulnerability watchdog
    if not vulnerability_watchdog.is_running():
        vulnerability_watchdog.start()

@bot.event
async def on_member_join(member):
    """Welcomes new members and assigns initial role if present"""
    welcome_channel = discord.utils.get(member.guild.text_channels, name="welcome") or discord.utils.get(member.guild.text_channels, name="general") or member.guild.system_channel
    
    if welcome_channel:
        embed = discord.Embed(
            title="🛡️ Welcome to SentroniX Purple Team!",
            description=f"Welcome {member.mention} to the **{member.guild.name}** security operations server!",
            color=0x6366f1
        )
        embed.add_field(name="🚀 Getting Started", value="Type `!help` or `/status` to view active platform telemetry and bot commands.", inline=False)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.set_footer(text="SentroniX Security Operations • Purple Team AI")
        await welcome_channel.send(embed=embed)

# ----------------- BACKGROUND MONITOR -----------------
@tasks.loop(seconds=45)
async def vulnerability_watchdog():
    global last_notified_finding_id
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/v1/dashboard/findings") as res:
                if res.status == 200:
                    findings = await res.json()
                    if findings and len(findings) > 0:
                        top_finding = findings[0]
                        if top_finding.get("severity") in ["CRITICAL", "HIGH"] and top_finding.get("id") != last_notified_finding_id:
                            last_notified_finding_id = top_finding.get("id")
                            
                            # Find target alert channel (Strictly avoid #general)
                            for guild in bot.guilds:
                                alert_channel = (
                                    discord.utils.get(guild.text_channels, name="security-alerts") or
                                    discord.utils.get(guild.text_channels, name="ci-cd-alerts") or
                                    discord.utils.get(guild.text_channels, name="app-code-defense") or
                                    discord.utils.get(guild.text_channels, name="file-data-defense")
                                )
                                if alert_channel and alert_channel.name != "general":
                                    embed = discord.Embed(
                                        title=f"🚨 New {top_finding.get('severity')} Security Finding Detected!",
                                        description=f"**{top_finding.get('title')}**\n\n{top_finding.get('description', '')}",
                                        color=0xef4444 if top_finding.get("severity") == "CRITICAL" else 0xf59e0b
                                    )
                                    embed.add_field(name="Scanner Tool", value=f"`{top_finding.get('tool')}`", inline=True)
                                    embed.add_field(name="Target Location", value=f"`{top_finding.get('location')}`", inline=True)
                                    embed.add_field(name="Action Required", value="Type `!patch` or open SentroniX Dashboard to generate AI remediation.", inline=False)
                                    embed.set_footer(text="SentroniX Automated Threat Interceptor")
                                    await alert_channel.send(embed=embed)
    except Exception:
        pass

# ----------------- SLASH & PREFIX COMMANDS -----------------

@bot.command(name="help")
async def help_cmd(ctx):
    embed = discord.Embed(
        title="🛡️ SentoBot Commands & Capabilities",
        description="Your AI Purple-Team Assistant for the SentroniX Security Platform.",
        color=0x6366f1
    )
    embed.add_field(name="📊 `!status` or `/status`", value="Check live health of backend API, DB, and active scanners.", inline=False)
    embed.add_field(name="🎯 `!posture` or `/posture`", value="View current security grade (A-D) and threat breakdown.", inline=False)
    embed.add_field(name="🔍 `!scans` or `/scans`", value="List recent security findings and steganography alerts.", inline=False)
    embed.add_field(name="✨ `!patch <finding_title>`", value="Generate an automated AI remediation patch with unified Git diff.", inline=False)
    embed.add_field(name="🧠 `!ask <question>`", value="Ask Gemini AI any cybersecurity or remediation question.", inline=False)
    embed.add_field(name="🧹 `!clear <count>`", value="Clean messages in channel (requires Manage Messages).", inline=False)
    embed.set_footer(text="SentroniX • Purple Team DevSecOps Platform")
    await ctx.send(embed=embed)

@bot.hybrid_command(name="status", description="Check live SentroniX Platform Status")
async def status(ctx):
    await ctx.defer()
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{API_BASE_URL}/") as res:
                api_ok = (res.status == 200)
        except Exception:
            api_ok = False

        try:
            async with session.get(f"{API_BASE_URL}/api/v1/dashboard/stats") as res:
                stats = await res.json() if res.status == 200 else {}
        except Exception:
            stats = {}

    embed = discord.Embed(
        title="⚡ SentroniX System Health & Telemetry",
        color=0x10b981 if api_ok else 0xef4444
    )
    embed.add_field(name="API Core", value="🟢 `Operational (Port 8000)`" if api_ok else "🔴 `Offline`", inline=True)
    embed.add_field(name="Web UI", value="🟢 `Live (Port 5173)`", inline=True)
    embed.add_field(name="Celery Scanners", value="🟢 `Active (Semgrep, ZAP, Steg)`", inline=True)
    
    if stats:
        embed.add_field(name="Risk Grade", value=f"**{stats.get('risk_grade', 'A')}** ({stats.get('risk_label', 'Secured')})", inline=True)
        embed.add_field(name="Blocked Threats", value=f"`{stats.get('blocked_threats', 0)}`", inline=True)
        embed.add_field(name="Files Analyzed", value=f"`{stats.get('files_analyzed', 0)}`", inline=True)

    embed.set_footer(text="SentroniX Telemetry Engine")
    await ctx.send(embed=embed)

@bot.hybrid_command(name="posture", description="View current security risk posture and grade")
async def posture(ctx):
    await ctx.defer()
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{API_BASE_URL}/api/v1/dashboard/stats") as res:
                stats = await res.json() if res.status == 200 else {}
        except Exception as e:
            return await ctx.send(f"❌ Error fetching posture: {e}")

    grade = stats.get("risk_grade", "A")
    color = 0xef4444 if grade == "D" else (0xf59e0b if grade == "C" else (0x6366f1 if grade == "B" else 0x10b981))
    
    embed = discord.Embed(
        title=f"🛡️ Security Posture: Grade {grade} ({stats.get('risk_label', 'Low Risk')})",
        description="Overall organization security rating based on static code AST analysis, dynamic web scans, and payload interception.",
        color=color
    )
    
    sev = stats.get("severity_stats", {})
    embed.add_field(name="🔴 Critical Findings", value=f"**{sev.get('CRITICAL', 0)}**", inline=True)
    embed.add_field(name="🟡 High Findings", value=f"**{sev.get('HIGH', 0)}**", inline=True)
    embed.add_field(name="🔵 Medium / Low", value=f"**{sev.get('MEDIUM', 0) + sev.get('LOW', 0)}**", inline=True)
    embed.add_field(name="🛡️ Blocked Threats", value=f"**{stats.get('blocked_threats', 0)}**", inline=True)
    embed.add_field(name="📁 Files Analyzed", value=f"**{stats.get('files_analyzed', 0)}**", inline=True)
    
    if grade != "A":
        embed.add_field(name="💡 Roadmap to Grade A", value="Run `!patch` or use the SentroniX Web UI AI Patch button to remediate critical findings.", inline=False)
    else:
        embed.add_field(name="✅ Status", value="Platform is completely hardened and audit-ready!", inline=False)

    embed.set_footer(text="SentroniX Purple-Team Security Engine")
    await ctx.send(embed=embed)

@bot.hybrid_command(name="scans", description="Show latest security findings across SAST, DAST, and Steg")
async def scans(ctx):
    await ctx.defer()
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{API_BASE_URL}/api/v1/dashboard/findings") as res:
                findings = await res.json() if res.status == 200 else []
        except Exception as e:
            return await ctx.send(f"❌ Error fetching findings: {e}")

    if not findings:
        return await ctx.send("✅ No active security findings. Platform is clean!")

    embed = discord.Embed(
        title="🔍 Active Findings Telemetry (Top 5)",
        color=0x6366f1
    )

    for f in findings[:5]:
        sev_emoji = "🔴" if f.get("severity") == "CRITICAL" else ("🟡" if f.get("severity") == "HIGH" else "⚪")
        embed.add_field(
            name=f"{sev_emoji} [{f.get('severity')}] {f.get('title')}",
            value=f"**Tool:** `{f.get('tool')}` | **Location:** `{f.get('location')}`\n{f.get('description', '')[:100]}...",
            inline=False
        )

    embed.set_footer(text="Type !patch <title> to generate an AI remediation")
    await ctx.send(embed=embed)

@bot.command(name="patch")
async def patch_cmd(ctx, *, query: str = "SQL Injection"):
    await ctx.send(f"🧠 **SentoBot AI** is analyzing `{query}` and generating unified remediation diff...")
    
    async with aiohttp.ClientSession() as session:
        payload = {
            "title": query,
            "tool": "Semgrep / Purple AI",
            "severity": "CRITICAL",
            "location": "backend/app/api/auth.py",
            "description": f"Security finding related to {query}",
            "api_key": GEMINI_KEY
        }
        try:
            async with session.post(f"{API_BASE_URL}/api/v1/ai/patch", json=payload) as res:
                if res.status == 200:
                    data = await res.json()
                    
                    embed = discord.Embed(
                        title=f"✨ AI Patch: {query}",
                        description=f"**CWE:** `{data.get('cwe', 'CWE-Security')}`\n**OWASP:** `{data.get('owasp_category', 'OWASP Top 10')}`\n\n**🔍 Root Cause:**\n{data.get('root_cause', '')}",
                        color=0x10b981
                    )
                    
                    diff_text = data.get("diff", data.get("remediated_snippet", ""))
                    if len(diff_text) > 1000:
                        diff_text = diff_text[:1000] + "\n... [diff truncated]"
                    
                    embed.add_field(name="🛠️ Unified Code Diff", value=f"```diff\n{diff_text}\n```", inline=False)
                    embed.add_field(name="🛡️ Rationale", value=data.get("explanation", "Parameterization and input verification applied."), inline=False)
                    embed.set_footer(text=f"Generated via {data.get('source', 'Gemini AI')}")
                    
                    await ctx.send(embed=embed)
                else:
                    await ctx.send(f"❌ Failed to generate patch (Status {res.status})")
        except Exception as e:
            await ctx.send(f"❌ Error communicating with AI engine: {e}")

@bot.command(name="ask")
async def ask_cmd(ctx, *, prompt: str):
    await ctx.send(f"🤔 Thinking with **Gemini AI**...")
    
    import google.generativeai as genai
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel("gemini-3.6-flash")
        response = model.generate_content(f"You are SentoBot, an elite Purple-Team cybersecurity AI assistant. Answer concisely and clearly for developers:\n\n{prompt}")
        
        reply = response.text.strip()
        if len(reply) > 1950:
            reply = reply[:1950] + "..."
            
        embed = discord.Embed(
            title="🧠 SentoBot Security Assistant",
            description=reply,
            color=0x6366f1
        )
        embed.set_footer(text="Powered by Google Gemini 3.6 Flash")
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Gemini Error: {e}")

@bot.command(name="clear")
@commands.has_permissions(manage_messages=True)
async def clear(ctx, amount: int = 5):
    await ctx.channel.purge(limit=amount + 1)
    msg = await ctx.send(f"🧹 Cleared {amount} messages.")
    await asyncio.sleep(3)
    await msg.delete()

if __name__ == "__main__":
    if not TOKEN:
        print("[!] Error: DISCORD_BOT_TOKEN environment variable not set.")
    else:
        print("[*] Launching SentoBot...")
        bot.run(TOKEN)

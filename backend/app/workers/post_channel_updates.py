import os
import asyncio
import discord
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

TOKEN = os.getenv("DISCORD_BOT_TOKEN")

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

client = discord.Client(intents=intents)

CHANNELS_UPDATES = {
    # 1. MANAGEMENT
    'standups': {
        'title': '📋 Daily Standup: SentroniX Platform (V3 Milestone)',
        'color': 0x6366f1,
        'fields': [
            ('✅ Completed (Past 24h)', '• Launched SentroniX Version 3 with Browser Extension V3 (Phishing Link Interceptor, Webmail Inspector, Download Scanner).\n• Standardized light design system matching SentroniX Web App UI.\n• Added zero-Docker 1-click standalone launchers (`run_sentronix_standalone.bat` & `.sh`).\n• Restored original purple pixel-art emoji logo across all assets.', False),
            ('🔄 In Progress', '• Firefox / Edge Web Store packaging and automated CI/CD release builds.', False),
            ('🛑 Blockers', '• None. All services and extension manifests passing verification.', False)
        ],
        'footer': 'SentroniX Management Operations • Purple Team AI V3'
    },
    'sprint-planning': {
        'title': '🎯 Sprint Planning: V3 Release Roadmap',
        'color': 0x3b82f6,
        'fields': [
            ('Epic 1: Active Defense Browser Extension V3', '• Real-Time Phishing Link Interceptor & Webmail Link Inspector.\n• Malicious Download & Steganography Interception.\n• Light Bento Card UI aligned with main SentroniX web app.', False),
            ('Epic 2: Zero-Docker Standalone Ecosystem', '• Embedded SQLite & Single-Port SPA serving (`http://localhost:8000`).\n• Portable 1-click Windows & Linux launchers.', False),
            ('Epic 3: AI Threat Intelligence & Remediation', '• Bring-Your-Own-Key Gemini AI integration & auto diff patch generator.', False)
        ],
        'footer': 'Sprint Velocity: High • Release Version: V3.0.0 PRO'
    },
    'retrospectives': {
        'title': '🔍 Sprint Retrospective: V3 Platform Delivery',
        'color': 0x8b5cf6,
        'fields': [
            ('🌟 What Went Well', '• Full synchronization between Chrome Extension V3 and SentroniX Web App UI.\n• Restored iconic purple pixel-art emoji logo.\n• Accurate delta-based link audit telemetry.', False),
            ('📈 Areas for Optimization', '• Edge & Firefox manifest compatibility testing.', False)
        ],
        'footer': 'Continuous Improvement • DevSecOps Quality Metrics'
    },

    # 2. DEV - BACKEND
    'dev-backend': {
        'title': '⚙️ Backend Architecture & Core Services V3 Update',
        'color': 0x10b981,
        'fields': [
            ('FastAPI Core (Port 8000)', '• `/api/v1/defense/check-url`: Real-time typosquatting, TLD, and brand mismatch analysis.\n• `/api/v1/defense/check-email`: Email sender mismatch & urgency cue detector.\n• `/api/v1/dashboard`: Telemetry stats and findings.\n• `/api/v1/ai/patch`: Gemini 3.6 Flash automated remediation diffs.', False),
            ('Database & Standalone Engine', '• Dual support for PostgreSQL 15 & Embedded SQLite (`sentronix.db`).', False)
        ],
        'footer': 'Backend Core • FastAPI V3 & Celery Engine'
    },
    'ai-engine': {
        'title': '🧠 Gemini AI Correlation & Threat Intelligence V3',
        'color': 0x06b6d4,
        'fields': [
            ('Primary LLM', '`Google Gemini 3.6 Flash` (Live BYOK API Key support).', True),
            ('Threat Intel Scanners', 'Typosquatting rules, homoglyph detector, suspicious TLD analyzer.', True),
            ('Remediation Capabilities', '• Generates unified diffs (`--- a/`, `+++ b/`).\n• Root cause analysis & adversary exploit vector simulation.', False)
        ],
        'footer': 'SentroniX AI Threat Subsystem'
    },
    'infra-devops': {
        'title': '🐳 Infrastructure & DevOps Telemetry V3',
        'color': 0x14b8a6,
        'fields': [
            ('Docker Compose Topology', '• `backend` (FastAPI / Port 8000)\n• `frontend` (Vite React / Port 5173)\n• `db` (PostgreSQL 15 / Port 5432)\n• `redis` (Redis 7 / Port 6379)\n• `worker` (Celery Scanners)', False),
            ('Standalone Launchers', '`run_sentronix_standalone.bat` & `.sh` (Zero-Docker support).', False)
        ],
        'footer': 'DevOps & Cloud Infrastructure'
    },

    # 3. DEV - FRONTEND
    'dev-frontend': {
        'title': '🎨 Frontend & Extension V3 Design System',
        'color': 0xf59e0b,
        'fields': [
            ('Tech Stack', 'React 18 + Vite + Tailwind CSS + Extension Manifest V3.', False),
            ('Design System', '• Off-white `#f9f9f8` theme with white bento cards.\n• Primary indigo `#372d8a` and lavender `#EEEDFE` accents.\n• Iconic purple pixel-art emoji logo (`loooogo2.png`).', False)
        ],
        'footer': 'SentroniX Frontend & Extension V3'
    },
    'dashboard-ui': {
        'title': '🖥️ Extension V3 & Arena UI Synchronization',
        'color': 0xd97706,
        'fields': [
            ('Extension Popup V3', '• Light bento card design aligned with web app UI.\n• Active Protection status & live telemetry counts.\n• Quick URL Inspector & Arena dashboard button.', False)
        ],
        'footer': 'UI/UX & Interactive Telemetry'
    },

    # 4. SECURITY TOOLS
    'app-code-defense': {
        'title': '🛡️ Application, Code & Browser Defense Telemetry V3',
        'color': 0xef4444,
        'fields': [
            ('Active Extension V3', 'Phishing Link Interceptor & Webmail Inspector.', False),
            ('Active SAST/DAST Engine', 'Semgrep, Nuclei, ZAP, and Trivy SCA.', False)
        ],
        'footer': 'Pillar 1: Application & Browser Defense'
    },
    'file-data-defense': {
        'title': '📦 File & Steganography Defense Telemetry',
        'color': 0xec4899,
        'fields': [
            ('Steganography Analyzer', 'Extracts hidden binary payloads from image carriers.', False),
            ('Malware Signature Engine', 'YARA rule scanning for reverse shell strings and malware containers.', False)
        ],
        'footer': 'Pillar 2: Data & Binary Integrity'
    },
    'iam-defense': {
        'title': '🔑 IAM & Access Control Defense',
        'color': 0x8b5cf6,
        'fields': [
            ('Authentication', 'JWT Bearer token authentication with password hashing (bcrypt).', False),
            ('RBAC Gates', 'Strict admin dependency checks on operational endpoints.', False)
        ],
        'footer': 'Pillar 3: Identity & Access Management'
    },
    'red-team-osint': {
        'title': '⚔️ Red Team & Offensive Operations Lab',
        'color': 0xdc2626,
        'fields': [
            ('Adversary Emulation Suite', 'Atomic test runners for MITRE ATT&CK tactics.', False),
            ('Exploit Re-Testing Engine', 'Automated closed-loop re-attack dispatcher.', False)
        ],
        'footer': 'Pillar 4: Offensive Ops & Purple Emulation'
    }
}

@client.event
async def on_ready():
    print(f"Logged in as {client.user}. Dispatching channel-specific updates...")
    for guild in client.guilds:
        print(f"Target Guild: {guild.name} (ID: {guild.id})")
        for ch_name, data in CHANNELS_UPDATES.items():
            channel = discord.utils.get(guild.text_channels, name=ch_name)
            if channel:
                embed = discord.Embed(
                    title=data['title'],
                    color=data['color']
                )
                for f_name, f_val, f_inline in data['fields']:
                    embed.add_field(name=f_name, value=f_val, inline=f_inline)
                embed.set_footer(text=data['footer'])
                try:
                    await channel.send(embed=embed)
                    print(f"  [OK] Posted update to #{ch_name}")
                except Exception as e:
                    print(f"  [ERR] Failed #{ch_name}: {e}")
            else:
                print(f"  [-] Channel #{ch_name} not found.")
    await client.close()

if __name__ == "__main__":
    client.run(TOKEN)


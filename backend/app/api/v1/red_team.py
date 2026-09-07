from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.red_team_engine import RedTeamEngine, STRIKE_HISTORY
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.vulnerability import Vulnerability
import os
import aiohttp
import asyncio

router = APIRouter()

class StrikeRequest(BaseModel):
    scenario_id: str = Field(..., example="sqli-auth-bypass")
    custom_payload: Optional[str] = Field(None, example="admin' OR '1'='1' --")
    target_override: Optional[str] = Field(None, example="/api/v1/auth/login")
    notify_discord: Optional[bool] = Field(True, description="Whether to dispatch alert to Discord mod channel")

@router.get("/scenarios")
def get_scenarios():
    """Retrieve all available adversary strike simulation scenarios mapped to MITRE ATT&CK"""
    return RedTeamEngine.get_all_scenarios()

@router.get("/metrics")
def get_metrics():
    """Retrieve Purple Team resilience metrics, interception rates, and detection latency"""
    return RedTeamEngine.get_metrics()

@router.get("/history")
def get_strike_history():
    """Retrieve history of recent simulated strikes and defense responses"""
    return STRIKE_HISTORY

@router.post("/strike")
async def execute_strike(req: StrikeRequest, db: Session = Depends(get_db)):
    """
    Executes a simulated Red Team attack strike against the designated vector,
    triggers real-time Blue Team interception, logs the telemetry, and updates resilience records.
    """
    scenario = RedTeamEngine.get_scenario_by_id(req.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    result = RedTeamEngine.execute_strike(
        scenario_id=req.scenario_id,
        custom_payload=req.custom_payload,
        target_override=req.target_override
    )

    # Automatically record finding into DB to link with AI Remediation pipeline
    try:
        new_vuln = Vulnerability(
            title=f"[Simulated Strike] {scenario['title']}",
            tool="SentroniX Red-Team Simulator",
            severity=scenario["severity"],
            location=result["red_team"]["target_endpoint"],
            description=f"Adversary strike simulation ({scenario['mitre_technique']}). Injected: {result['red_team']['injected_payload']}. Intercepted by {result['blue_team']['inspection_rule']}."
        )
        db.add(new_vuln)
        db.commit()
        db.refresh(new_vuln)
        result["db_finding_id"] = new_vuln.id
    except Exception:
        db.rollback()

    # If Discord notification enabled, post to Discord Mod Alerts channel
    bot_token = os.getenv("DISCORD_BOT_TOKEN")
    if req.notify_discord and bot_token:
        asyncio.create_task(dispatch_discord_mod_alert(result, bot_token))

    return result

async def dispatch_discord_mod_alert(result: Dict[str, Any], token: str):
    """Background helper to alert SentoBot Discord #mod-security-alerts channel of the strike simulation"""
    try:
        import discord
        intents = discord.Intents.default()
        client = discord.Client(intents=intents)

        @client.event
        async def on_ready():
            for guild in client.guilds:
                channel = (
                    discord.utils.get(guild.text_channels, name="mod-security-alerts") or
                    discord.utils.get(guild.text_channels, name="mod-only")
                )
                if channel:
                    embed = discord.Embed(
                        title=f"⚔️ [RED TEAM STRIKE] {result['title']}",
                        description=f"**MITRE ATT&CK:** `{result['mitre_technique']}`\n**Target:** `{result['red_team']['target_endpoint']}`\n\n**Injected Payload:**\n```{result['red_team']['injected_payload'][:200]}```",
                        color=0xef4444
                    )
                    embed.add_field(name="🔵 Blue Team Status", value=f"`{result['blue_team']['defense_status']}`", inline=True)
                    embed.add_field(name="⚡ Inspection Time", value=f"`{result['blue_team']['latency_ms']} ms`", inline=True)
                    embed.add_field(name="🛡️ Intercept Rule", value=f"`{result['blue_team']['inspection_rule']}`", inline=False)
                    embed.add_field(name="✨ AI Remediation", value="Run `!patch` or open SentroniX Arena to view auto-generated code diff.", inline=False)
                    embed.set_footer(text=f"SentroniX Purple Team Arena • Strike ID: {result['strike_id']}")
                    await channel.send(embed=embed)
            await client.close()

        await client.start(token)
    except Exception:
        pass

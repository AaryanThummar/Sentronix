from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.red_team_engine import RedTeamEngine, STRIKE_HISTORY
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.vulnerability import UnifiedFinding
import os
import asyncio

router = APIRouter()

class StrikeRequest(BaseModel):
    scenario_id: str = Field(..., example="sqli-auth-bypass")
    custom_payload: Optional[str] = Field(None, example="admin' OR '1'='1' --")
    target_override: Optional[str] = Field(None, example="/api/v1/auth/login")
    notify_discord: Optional[bool] = Field(True, description="Whether to dispatch alert to Discord mod channel")
    waf_overrides: Optional[Dict[str, bool]] = Field(None, description="Dynamic WAF rule toggles")

class CampaignRequest(BaseModel):
    campaign_id: str = Field(..., example="campaign-web-infiltrator")
    notify_discord: Optional[bool] = Field(True)

class WAFToggleRequest(BaseModel):
    rule_key: str = Field(..., example="AST_SQLI_GUARD")
    enabled: bool = Field(..., example=True)

@router.get("/scenarios")
def get_scenarios():
    """Retrieve all available adversary strike simulation scenarios (PayloadsAllTheThings & Atomic Red Team)"""
    return RedTeamEngine.get_all_scenarios()

@router.get("/waf-rules")
def get_waf_rules():
    """Retrieve all WAF defensive inspection rules and policy states"""
    return RedTeamEngine.get_waf_rules()

@router.post("/waf-rules/toggle")
def toggle_waf_rule(req: WAFToggleRequest):
    """Dynamically enable or disable a WAF rule in the sandbox"""
    return RedTeamEngine.toggle_waf_rule(req.rule_key, req.enabled)

@router.get("/campaigns")
def get_campaigns():
    """Retrieve multi-phase adversary emulation profiles (MITRE Caldera)"""
    return RedTeamEngine.get_caldera_campaigns()

@router.get("/fuzzing/seclists")
def get_seclists_probes():
    """Retrieve sensitive path discovery dictionary (SecLists)"""
    return RedTeamEngine.get_seclists_probes()

@router.post("/fuzzing/run")
def run_fuzzing():
    """Execute SecLists sensitive endpoint discovery and return defense responses"""
    return RedTeamEngine.run_seclists_fuzzing()

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
        target_override=req.target_override,
        waf_overrides=req.waf_overrides
    )

    # Automatically record finding into DB to link with AI Remediation pipeline
    try:
        new_vuln = UnifiedFinding(
            scan_id=f"SCAN-{result['strike_id']}",
            tenant_id="default-tenant",
            pillar=scenario.get("category", "App & Code Defense"),
            tool_used=f"SentroniX Red Team ({scenario.get('source_repo', 'Adversary Simulator')})",
            vulnerability_title=f"[Simulated Strike] {scenario['title']}",
            severity=scenario["severity"],
            cwe_id=scenario.get("cwe", "CWE-Security"),
            location=result["red_team"]["target_endpoint"],
            description=f"Adversary strike simulation ({scenario['mitre_technique']}). Injected: {result['red_team']['injected_payload']}. Intercepted by {result['blue_team']['inspection_rule']}.",
            raw_payload=result["red_team"]["injected_payload"]
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

@router.post("/campaigns/run")
async def run_campaign(req: CampaignRequest):
    """Executes a multi-phase MITRE Caldera adversary campaign simulation"""
    return RedTeamEngine.execute_campaign(req.campaign_id)

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
                        description=f"**Source:** `{result.get('source_repo', 'PayloadsAllTheThings')}`\n**MITRE ATT&CK:** `{result['mitre_technique']}`\n**Target:** `{result['red_team']['target_endpoint']}`\n\n**Injected Payload:**\n```{result['red_team']['injected_payload'][:200]}```",
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

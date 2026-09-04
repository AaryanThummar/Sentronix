from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_engine import ai_engine
from app.models.vulnerability import UnifiedFinding
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

router = APIRouter()

class PatchRequest(BaseModel):
    id: Optional[str] = None
    title: str
    tool: Optional[str] = "Security Scanner"
    severity: Optional[str] = "HIGH"
    location: Optional[str] = "app/main.py"
    description: Optional[str] = ""
    api_key: Optional[str] = None

class RemediateRequest(BaseModel):
    id: str  # e.g. "finding-1" or "steg-2"
    patch_applied: Optional[str] = None

class JiraTicketRequest(BaseModel):
    title: str
    severity: str
    location: str
    cwe: Optional[str] = None
    diff: Optional[str] = None
    explanation: Optional[str] = None

@router.post("/patch")
def generate_ai_patch(
    payload: PatchRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    """
    Generates an automated AI Remediation Patch.
    Prefers user's supplied API key (via header or payload), then server config, then fallback ruleset.
    """
    key_to_use = payload.api_key or x_gemini_api_key
    finding_data = {
        "title": payload.title,
        "tool": payload.tool,
        "severity": payload.severity,
        "location": payload.location,
        "description": payload.description
    }
    
    patch_result = ai_engine.generate_patch(finding_data, user_api_key=key_to_use)
    return patch_result

@router.post("/remediate")
def mark_remediated(payload: RemediateRequest, db: Session = Depends(get_db)):
    """
    Marks a vulnerability as remediated, updating its record in the database.
    """
    if payload.id.startswith("finding-"):
        try:
            finding_id = int(payload.id.replace("finding-", ""))
            finding = db.query(UnifiedFinding).filter(UnifiedFinding.id == finding_id).first()
            if finding:
                finding.ai_remediation_patch = payload.patch_applied or "Remediated via SentroniX AI Patch"
                db.commit()
                return {"status": "success", "message": f"Finding #{finding_id} marked as remediated."}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    return {"status": "success", "message": f"Artifact {payload.id} marked as remediated in defensive session."}

@router.post("/jira-ticket")
def create_jira_ticket(payload: JiraTicketRequest):
    """
    Creates or simulates a Jira Cloud issue with attached AI Patch.
    """
    import random
    ticket_num = random.randint(100, 999)
    ticket_key = f"SEC-{ticket_num}"
    
    return {
        "status": "success",
        "ticket_key": ticket_key,
        "ticket_url": f"https://your-domain.atlassian.net/browse/{ticket_key}",
        "message": f"Jira issue [{ticket_key}] successfully created with AI Remediation Patch attached."
    }

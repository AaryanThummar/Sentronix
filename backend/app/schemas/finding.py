from pydantic import BaseModel
from typing import Optional

class UnifiedFindingBase(BaseModel):
    scan_id: str
    tenant_id: str
    pillar: str
    tool_used: str
    vulnerability_title: str
    severity: str
    cwe_id: str
    location: str
    description: str
    raw_payload: Optional[str] = None
    ai_explanation: Optional[str] = None
    ai_remediation_patch: Optional[str] = None

class UnifiedFindingCreate(UnifiedFindingBase):
    pass

class UnifiedFindingResponse(UnifiedFindingBase):
    id: int

    class Config:
        from_attributes = True

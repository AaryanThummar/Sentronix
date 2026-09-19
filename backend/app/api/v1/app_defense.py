import uuid
import redis
from typing import Optional
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.vulnerability import UnifiedFinding
from app.workers import tasks_app_defense

router = APIRouter()

# Requests schemas
class SastRequest(BaseModel):
    repo_path: str

class DastRequest(BaseModel):
    target_url: str
    scan_type: str  # 'zap' or 'nuclei'

class ScaRequest(BaseModel):
    target_path: str

def is_redis_online() -> bool:
    """Helper to detect if Redis Celery broker is online."""
    try:
        from app.core.config import settings
        # Parse connection info from REDIS_URI
        r = redis.from_url(settings.REDIS_URI, socket_connect_timeout=1)
        r.ping()
        return True
    except Exception:
        return False

def trigger_scan_task(task_func, background_tasks: BackgroundTasks, *args, **kwargs):
    """
    Submits scan execution to Celery if active.
    Otherwise, gracefully runs synchronously inside FastAPI BackgroundTasks to support SQLite fallback.
    """
    if is_redis_online():
        try:
            task = task_func.delay(*args, **kwargs)
            return task.id
        except Exception:
            pass

    # Local BackgroundTask thread execution fallback
    background_tasks.add_task(task_func, *args, **kwargs)
    return f"local-bg-{uuid.uuid4().hex[:8]}"

@router.post("/sast")
def run_sast(req: SastRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
    scan_id = f"sast-{uuid.uuid4().hex[:8]}"
    task_id = trigger_scan_task(
        tasks_app_defense.run_sast_semgrep_scan,
        background_tasks,
        scan_id,
        req.repo_path,
        tenant_id=tenant
    )
    return {"task_id": task_id, "scan_id": scan_id}

@router.post("/dast")
def run_dast(req: DastRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    if req.scan_type.lower() not in ["zap", "nuclei"]:
        raise HTTPException(status_code=400, detail="Scan type must be either 'zap' or 'nuclei'")
        
    tenant = x_tenant_id or "default-tenant"
    scan_id = f"dast-{uuid.uuid4().hex[:8]}"
    task_func = tasks_app_defense.run_dast_zap_scan if req.scan_type.lower() == "zap" else tasks_app_defense.run_dast_nuclei_scan
    
    task_id = trigger_scan_task(
        task_func,
        background_tasks,
        scan_id,
        req.target_url,
        tenant_id=tenant
    )
    return {"task_id": task_id, "scan_id": scan_id}

@router.post("/sca")
def run_sca(req: ScaRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
    scan_id = f"sca-{uuid.uuid4().hex[:8]}"
    task_id = trigger_scan_task(
        tasks_app_defense.run_sca_trivy_scan,
        background_tasks,
        scan_id,
        req.target_path,
        tenant_id=tenant
    )
    return {"task_id": task_id, "scan_id": scan_id}

@router.get("/results/{scan_id}")
def get_results(scan_id: str, db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    findings = db.query(UnifiedFinding).filter(
        UnifiedFinding.scan_id == scan_id,
        UnifiedFinding.pillar == "Application & Code-Level Defense"
    ).all()
    
    # Claim any existing findings for this tenant if previously created under default-tenant
    tenant = x_tenant_id or "default-tenant"
    if tenant != "default-tenant" and findings:
        for f in findings:
            if f.tenant_id == "default-tenant" or not f.tenant_id:
                f.tenant_id = tenant
        db.commit()
    
    return {
        "scan_id": scan_id,
        "findings_count": len(findings),
        "findings": [
            {
                "id": f.id,
                "tool": f.tool_used,
                "title": f.vulnerability_title,
                "severity": f.severity,
                "location": f.location,
                "cwe": f.cwe_id if f.cwe_id else "CWE-Unknown",
                "description": f.description,
                "payload": f.raw_payload
            } for f in findings
        ]
    }

@router.get("/findings")
def get_all_app_defense_findings(db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
    if tenant == "default-tenant":
        findings = db.query(UnifiedFinding).filter(
            UnifiedFinding.pillar == "Application & Code-Level Defense",
            (UnifiedFinding.tenant_id == "default-tenant") | (UnifiedFinding.tenant_id == None)
        ).order_by(UnifiedFinding.id.desc()).limit(50).all()
    else:
        findings = db.query(UnifiedFinding).filter(
            UnifiedFinding.pillar == "Application & Code-Level Defense",
            UnifiedFinding.tenant_id == tenant
        ).order_by(UnifiedFinding.id.desc()).limit(50).all()
    
    return [
        {
            "id": f.id,
            "tool": f.tool_used,
            "title": f.vulnerability_title,
            "severity": f.severity,
            "location": f.location,
            "cwe": f.cwe_id if f.cwe_id else "CWE-Unknown",
            "description": f.description,
            "payload": f.raw_payload,
            "scan_id": f.scan_id
        } for f in findings
    ]

@router.get("/stats")
def get_app_defense_stats(db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
    if tenant == "default-tenant":
        findings = db.query(UnifiedFinding).filter(
            UnifiedFinding.pillar == "Application & Code-Level Defense",
            (UnifiedFinding.tenant_id == "default-tenant") | (UnifiedFinding.tenant_id == None)
        ).all()
    else:
        findings = db.query(UnifiedFinding).filter(
            UnifiedFinding.pillar == "Application & Code-Level Defense",
            UnifiedFinding.tenant_id == tenant
        ).all()
    
    critical = sum(1 for f in findings if f.severity == "CRITICAL")
    high = sum(1 for f in findings if f.severity == "HIGH")
    medium = sum(1 for f in findings if f.severity == "MEDIUM")
    low = sum(1 for f in findings if f.severity in ["LOW", "INFO"])
    
    # Calculate unique scans run
    unique_scans = len(set(f.scan_id for f in findings if f.scan_id))
    
    return {
        "total_scans": unique_scans,
        "critical_high_count": critical + high,
        "medium_low_count": medium + low,
        "total_findings": len(findings)
    }

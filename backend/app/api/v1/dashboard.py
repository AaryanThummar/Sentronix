from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vulnerability import UnifiedFinding
from app.models.steg import StegAnalysisResult
from typing import List, Dict, Any, Optional

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
    
    # 1. Fetch live findings scoped to this workspace
    if tenant == "default-tenant":
        findings = db.query(UnifiedFinding).filter(
            (UnifiedFinding.tenant_id == "default-tenant") | (UnifiedFinding.tenant_id == None)
        ).all()
    else:
        findings = db.query(UnifiedFinding).filter(UnifiedFinding.tenant_id == tenant).all()

    steg_results = db.query(StegAnalysisResult).all()

    # 2. Compute counts
    critical_count = sum(1 for f in findings if f.severity == "CRITICAL")
    high_count = sum(1 for f in findings if f.severity == "HIGH")
    medium_count = sum(1 for f in findings if f.severity == "MEDIUM")
    low_count = sum(1 for f in findings if f.severity == "LOW")

    # Flag steg findings containing '[!] ALERT' as HIGH threat (only for default tenant or global)
    steg_threats = sum(1 for s in steg_results if s.findings and "[!] ALERT" in s.findings) if tenant == "default-tenant" else 0
    total_steg_scans = len(steg_results) if tenant == "default-tenant" else 0

    # 3. Calculate defensive ops metrics
    files_analyzed = total_steg_scans + len(findings)  # Every scan or finding represents an analysis
    blocked_threats = critical_count + high_count + steg_threats
    active_vectors_count = len(set(f.vulnerability_title for f in findings if f.vulnerability_title))

    # 4. Calculate True Risk Grade (Not fake placeholder)
    if files_analyzed == 0:
        risk_grade = "—"
        risk_label = "Unassessed"
    elif critical_count > 0:
        risk_grade = "D"
        risk_label = "High Risk"
    elif high_count > 0 or steg_threats > 0:
        risk_grade = "C"
        risk_label = "Medium Risk"
    elif medium_count > 0:
        risk_grade = "B"
        risk_label = "Low Risk"
    else:
        risk_grade = "A"
        risk_label = "Hardened"

    return {
        "risk_grade": risk_grade,
        "risk_label": risk_label,
        "critical_findings": critical_count,
        "blocked_threats": blocked_threats,
        "files_analyzed": files_analyzed,
        "active_vectors": active_vectors_count,
        "severity_stats": {
            "CRITICAL": critical_count,
            "HIGH": high_count + steg_threats,
            "MEDIUM": medium_count,
            "LOW": low_count
        }
    }

@router.get("/findings")
def get_dashboard_findings(db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)) -> List[Dict[str, Any]]:
    tenant = x_tenant_id or "default-tenant"
    
    # Fetch latest findings scoped to tenant
    if tenant == "default-tenant":
        findings = db.query(UnifiedFinding).filter(
            (UnifiedFinding.tenant_id == "default-tenant") | (UnifiedFinding.tenant_id == None)
        ).order_by(UnifiedFinding.id.desc()).limit(15).all()
        steg_results = db.query(StegAnalysisResult).order_by(StegAnalysisResult.id.desc()).limit(5).all()
    else:
        findings = db.query(UnifiedFinding).filter(
            UnifiedFinding.tenant_id == tenant
        ).order_by(UnifiedFinding.id.desc()).limit(15).all()
        steg_results = []

    merged_findings = []

    # Map steg results to Unified Finding structure
    for s in steg_results:
        is_threat = s.findings and "[!] ALERT" in s.findings
        severity = "HIGH" if is_threat else "INFO"
        
        # Extract preview snippet of findings
        preview = "Normal image structure."
        if s.findings:
            first_lines = [line.strip() for line in s.findings.split("\n") if line.strip()]
            alert_line = next((line for line in first_lines if "[!] ALERT" in line), None)
            preview = alert_line if alert_line else (first_lines[0] if first_lines else "No findings details.")

        merged_findings.append({
            "id": f"steg-{s.id}",
            "severity": severity,
            "title": f"Steg Analysis: {s.filename}",
            "tool": "stegextract",
            "location": s.filename,
            "description": preview,
            "action": "review"
        })

    # Map standard findings
    for f in findings:
        merged_findings.append({
            "id": f"finding-{f.id}",
            "severity": f.severity,
            "title": f.vulnerability_title,
            "tool": f.tool_used,
            "location": f.location,
            "description": f.description,
            "action": "patch" if f.severity in ["CRITICAL", "HIGH"] else "review"
        })

    # Sort merged list by ID (highest/latest first)
    # The ids are string keys now, so we can sort them using simple heuristics or keep them order-preserved
    # To keep it simple, we interleave them or sort them. Since steg-ID and finding-ID have integers, 
    # we can parse and sort, or just return them as combined list.
    def get_sort_key(item):
        # Extract integer part from id (e.g. 'steg-5' -> 5)
        try:
            return int(item["id"].split("-")[1])
        except:
            return 0

    merged_findings.sort(key=get_sort_key, reverse=True)

    return merged_findings[:15]  # Limit to top 15 total items

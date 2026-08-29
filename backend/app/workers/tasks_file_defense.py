import subprocess
from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.vulnerability import UnifiedFinding

@celery_app.task(name="app.workers.tasks_file_defense.run_yara")
def run_yara(file_path: str, scan_id: str, tenant_id: str):
    # This is a stub showing how YARA or Stegextract would be executed via subprocess
    # Simulating a finding
    db = SessionLocal()
    try:
        finding = UnifiedFinding(
            scan_id=scan_id,
            tenant_id=tenant_id,
            pillar="File & Data Defense",
            tool_used="YARA",
            vulnerability_title="Suspicious Macro Payload",
            severity="HIGH",
            location=file_path,
            description="YARA rule triggered for embedded macro in Office document."
        )
        db.add(finding)
        db.commit()
    finally:
        db.close()
        
    return {"status": "success", "scan_id": scan_id}

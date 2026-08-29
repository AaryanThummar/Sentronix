import subprocess
import json
from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.vulnerability import UnifiedFinding

@celery_app.task(name="app.workers.tasks_sast.run_semgrep")
def run_semgrep(target_dir: str, scan_id: str, tenant_id: str):
    # This is a stub showing how Semgrep would be executed via subprocess in Docker
    # e.g., subprocess.run(["docker", "run", "--rm", "-v", f"{target_dir}:/src", "returntocorp/semgrep", "semgrep", "--json", "/src"], capture_output=True)
    
    # Simulating results for scaffolding purposes
    simulated_results = {
        "results": [
            {
                "check_id": "python.lang.security.audit.exec-use.exec-use",
                "path": "test.py",
                "start": {"line": 10},
                "extra": {
                    "message": "Use of exec detected",
                    "severity": "WARNING"
                }
            }
        ]
    }
    
    db = SessionLocal()
    try:
        for result in simulated_results["results"]:
            finding = UnifiedFinding(
                scan_id=scan_id,
                tenant_id=tenant_id,
                pillar="Application & Code-Level Defense",
                tool_used="Semgrep",
                vulnerability_title=result["check_id"],
                severity=result["extra"]["severity"],
                location=f"{result['path']}:{result['start']['line']}",
                description=result["extra"]["message"]
            )
            db.add(finding)
        db.commit()
    finally:
        db.close()
    
    return {"status": "success", "scan_id": scan_id}

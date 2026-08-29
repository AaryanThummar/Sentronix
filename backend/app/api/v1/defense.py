from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vulnerability import UnifiedFinding
import re

router = APIRouter()

# Simple YARA-like regex malware signatures
THREAT_SIGNATURES = [
    {
        "name": "EICAR Test Virus Standard Signature",
        "pattern": r"X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H\+H\*",
        "severity": "CRITICAL",
        "cwe_id": "CWE-506", # Embedded Malicious Code
        "description": "Standard anti-virus test file signature (EICAR) detected. Used for verifying anti-malware pipeline operational integrity."
    },
    {
        "name": "Reverse Shell Shellcode / Syntax",
        "pattern": r"(nc\s+-[e|c]\s+/(bin/)?(sh|bash|zsh))|(bash\s+-i\s*>&?\s*/dev/tcp/)|(fsockopen\(.*,\s*.*(4444|1337|9001|8080|8888))",
        "severity": "CRITICAL",
        "cwe_id": "CWE-78", # OS Command Injection / Remote Execution
        "description": "Active reverse shell socket connections or command execution syntax detected (e.g. Netcat connector, socket bind, or TCP stream pipe)."
    },
    {
        "name": "Dynamic Code Evaluation Payload (Web Shell)",
        "pattern": r"(eval\s*\(\s*base64_decode)|(eval\s*\(\s*\$_POST)|(system\s*\(\s*\$_(GET|POST|REQUEST))|(shell_exec\s*\(\s*\$_(GET|POST|REQUEST))|(exec\s*\(base64\.b64decode)|(eval\s*\(compile\()",
        "severity": "HIGH",
        "cwe_id": "CWE-94", # Code Injection
        "description": "Suspicious use of dynamic compilation/evaluation (eval/exec) coupled with external input parameters or base64 decoding. Highly indicative of webshell injection."
    },
    {
        "name": "Destructive CLI Execution Flag",
        "pattern": r"rm\s+-rf\s+/(?!$)",
        "severity": "HIGH",
        "cwe_id": "CWE-250", # Execution with Unnecessary Privileges
        "description": "A force delete command targeted at the root directory level was detected in script syntax."
    },
]

@router.post("/scan")
async def scan_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content_bytes = await file.read()
        # Decode as text (ignoring bad bytes for binary analysis)
        content_text = content_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    findings_logged = []
    
    # Run signature scanner
    for sig in THREAT_SIGNATURES:
        match = re.search(sig["pattern"], content_text, re.IGNORECASE)
        if match:
            # Create standard Unified Finding
            finding = UnifiedFinding(
                scan_id="file-defense-scan",
                tenant_id="default-tenant",
                pillar="File & Data Defense",
                tool_used="Malware Scanner",
                vulnerability_title=sig["name"],
                severity=sig["severity"],
                cwe_id=sig["cwe_id"],
                location=file.filename,
                description=sig["description"]
            )
            db.add(finding)
            findings_logged.append({
                "title": sig["name"],
                "severity": sig["severity"],
                "cwe": sig["cwe_id"],
                "description": sig["description"]
            })

    db.commit()

    if not findings_logged:
        return {
            "filename": file.filename,
            "status": "clean",
            "findings_count": 0,
            "findings": []
        }
    
    return {
        "filename": file.filename,
        "status": "malicious",
        "findings_count": len(findings_logged),
        "findings": findings_logged
    }

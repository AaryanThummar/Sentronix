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
async def scan_file(file: UploadFile = File(...), db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    tenant = x_tenant_id or "default-tenant"
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
                tenant_id=tenant,
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


# =============================================================================
# SENTRONIX V3: PHISHING & MALICIOUS URL INSPECTION ENGINE
# =============================================================================

KNOWN_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix", "facebook",
    "instagram", "chase", "bankofamerica", "wellsfargo", "binance", "coinbase",
    "dropbox", "github", "linkedin", "twitter", "whatsapp", "telegram"
]

SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".zip", ".mov",
    ".buzz", ".icu", ".work", ".click", ".link", ".cc", ".su", ".fit"
]

PHISHING_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "banking", "signin",
    "password", "auth", "confirm", "wallet", "suspended", "security-alert",
    "billing", "invoice", "payment", "re-activate", "unlock"
]

@router.post("/check-url")
async def check_url(payload: dict, db: Session = Depends(get_db), x_tenant_id: Optional[str] = Header(None)):
    """
    Analyzes a URL for phishing, typosquatting, deceptive brand spoofing,
    and malware distribution vectors.
    """
    tenant = x_tenant_id or "default-tenant"
    url = payload.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    risk_score = 0
    threat_reasons = []
    category = "clean"
    is_phishing = False

    url_lower = url.lower()

    # 1. Check IP-based Hostname (e.g., http://192.168.1.1/login or http://45.33.32.156)
    ip_pattern = r"^https?://(\d{1,3}\.){3}\d{1,3}(:\d+)?(/.*)?$"
    if re.match(ip_pattern, url_lower):
        risk_score += 45
        threat_reasons.append("URL uses raw numerical IP address instead of domain hostname (high phishing risk).")

    # 2. Check Punycode / IDN Homograph Attacks (e.g. xn--)
    if "xn--" in url_lower:
        risk_score += 40
        threat_reasons.append("Internationalized Domain Name (Punycode xn--) detected; potential homograph spoofing.")

    # 3. Check Suspicious TLDs
    for tld in SUSPICIOUS_TLDS:
        if tld in url_lower:
            risk_score += 25
            threat_reasons.append(f"Suspicious or high-abuse Top-Level Domain ({tld}) detected.")
            break

    # 4. Check Brand Impersonation & Typosquatting
    for brand in KNOWN_BRANDS:
        # If brand appears in URL path or subdomain, check if it's the genuine domain
        if brand in url_lower:
            # Genuine domain pattern: e.g. .paypal.com/ or https://paypal.com/
            genuine_pattern = rf"^https?://([a-zA-Z0-9_-]+\.)*{brand}\.(com|org|net|co|io|edu|gov)(/.*)?$"
            if not re.match(genuine_pattern, url_lower):
                risk_score += 50
                threat_reasons.append(f"Deceptive Brand Spoofing: Brand '{brand}' found in non-official domain.")
                break

    # 5. Typosquatting permutations (e.g. paypa1, arnazon, g00gle, rnicrosoft)
    typo_patterns = [
        (r"paypa[l1i]", "paypal"),
        (r"g[0o]{2}gle", "google"),
        (r"arnazon", "amazon"),
        (r"rnicrosoft|micros0ft", "microsoft"),
        (r"netf[l1i]x", "netflix"),
        (r"app[l1i]e", "apple"),
    ]
    for pattern, legit in typo_patterns:
        if re.search(pattern, url_lower) and legit not in url_lower:
            risk_score += 55
            threat_reasons.append(f"Typosquatting Detected: Domain deliberately mimics '{legit}'.")

    # 6. Check Phishing Urgency Keywords combined with Subdomains
    keyword_matches = [kw for kw in PHISHING_KEYWORDS if kw in url_lower]
    if len(keyword_matches) >= 2:
        risk_score += 30
        threat_reasons.append(f"Multiple high-risk credential/banking keywords found: {', '.join(keyword_matches[:3])}")
    elif len(keyword_matches) == 1 and risk_score > 20:
        risk_score += 15
        threat_reasons.append(f"Phishing lure keyword detected: '{keyword_matches[0]}'.")

    # 7. Check Excessive Subdomains (e.g. secure.login.paypal.verify.attacker.com)
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
        subdomain_count = hostname.count(".")
        if subdomain_count >= 4:
            risk_score += 25
            threat_reasons.append(f"Excessive subdomain nesting ({subdomain_count} levels); common in phishing camouflage.")
    except Exception:
        pass

    # 8. Check @ Symbol credential confusion (e.g. http://legit.com@evil.com)
    if "@" in url:
        risk_score += 60
        threat_reasons.append("URL contains '@' credential confusion delimiter routing to secondary host.")

    # Determine Severity
    if risk_score >= 50:
        is_phishing = True
        category = "phishing"
    elif risk_score >= 25:
        category = "suspicious"
    else:
        category = "clean"

    # Log to Unified Findings if malicious
    if is_phishing:
        try:
            finding = UnifiedFinding(
                scan_id="v3-phishing-url-scan",
                tenant_id=tenant,
                pillar="File & Data Defense",
                tool_used="Phishing Intelligence Engine",
                vulnerability_title=f"Phishing Link Intercepted: {url[:80]}",
                severity="HIGH" if risk_score < 75 else "CRITICAL",
                cwe_id="CWE-1021", # Improper Restriction of Rendered UI / Deceptive Links
                location=url[:255],
                description=f"Automated browser defense intercepted a deceptive phishing URL. Risk Score: {min(risk_score, 100)}/100. Reasons: {'; '.join(threat_reasons)}"
            )
            db.add(finding)
            db.commit()
        except Exception as e:
            db.rollback()
            # Non-blocking if table not initialized yet in standalone test
            pass

    return {
        "url": url,
        "is_phishing": is_phishing,
        "risk_score": min(risk_score, 100),
        "category": category,
        "reasons": threat_reasons if threat_reasons else ["No known malicious patterns identified."]
    }


@router.post("/check-email")
async def check_email(payload: dict, db: Session = Depends(get_db)):
    """
    Scans email body text and sender metadata for phishing urgency cues,
    spoofed domains, and deceptive links.
    """
    subject = payload.get("subject", "")
    sender = payload.get("sender", "")
    body = payload.get("body", "")
    links = payload.get("links", [])

    risk_score = 0
    threat_reasons = []

    text_to_scan = f"{subject} {body}".lower()

    # Urgency cues
    urgency_phrases = [
        "account suspended", "immediate action required", "verify your identity within 24 hours",
        "unauthorized transaction detected", "reset your password immediately", "failure to respond will result in closure",
        "wire transfer pending", "tax refund pending", "confirm your credit card details"
    ]
    matched_phrases = [p for p in urgency_phrases if p in text_to_scan]
    if matched_phrases:
        risk_score += 35
        threat_reasons.append(f"High-urgency social engineering cues detected: '{matched_phrases[0]}'")

    # Sender vs Brand mismatch
    for brand in KNOWN_BRANDS:
        if brand in subject.lower() or brand in body.lower():
            if sender and not sender.lower().endswith(f"@{brand}.com"):
                risk_score += 45
                threat_reasons.append(f"Sender domain mismatch: Email claims to represent '{brand}' but originates from '{sender}'.")
                break

    # Check embedded links
    for link in links:
        link_lower = link.lower()
        if any(tld in link_lower for tld in SUSPICIOUS_TLDS):
            risk_score += 30
            threat_reasons.append("Email contains links pointing to high-risk / untrusted Top-Level Domains.")
            break

    is_phishing = risk_score >= 40
    return {
        "is_phishing": is_phishing,
        "risk_score": min(risk_score, 100),
        "category": "phishing" if is_phishing else ("suspicious" if risk_score >= 20 else "clean"),
        "reasons": threat_reasons if threat_reasons else ["Email body appears benign."]
    }


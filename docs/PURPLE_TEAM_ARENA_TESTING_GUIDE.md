# ⚔️ SentroniX Purple Team Arena: Comprehensive Manual Testing & Technical Guide

This document is a **complete manual testing guide and technical explanation handbook** for the **SentroniX Purple Team Arena**. 

It details:
1. **Exact Step-by-Step Testing Actions** you perform in the interface.
2. **🧠 What You Are Doing (Attacker Intent & Cyber Mechanism)**: The technical concept behind each test.
3. **🔍 What the System Shows and WHY**: Why specific status codes (`403`, `200`), latency metrics, and terminal logs appear.
4. **🎓 Professor / Viva Talking Points**: Concise explanations you can speak out loud during your academic project demonstration.

---

## 📑 Table of Contents
1. [Platform Architecture & Access](#1-platform-architecture--access)
2. [Test 1: Atomic Strike Simulation (MITRE ATT&CK TTPs)](#2-test-1-atomic-strike-simulation-mitre-attck-ttps)
3. [Test 2: Forensic Raw Packet Stream Inspector](#3-test-2-forensic-raw-packet-stream-inspector)
4. [Test 3: WAF Policy Switchboard & Real-Time Defense Bypass](#4-test-3-waf-policy-switchboard--real-time-defense-bypass)
5. [Test 4: Live Target Endpoint Fuzzer (Fuzzing External & Live Websites)](#5-test-4-live-target-endpoint-fuzzer-fuzzing-external--live-websites)
6. [Test 5: MITRE Caldera Autonomous APT Campaign Emulation](#6-test-5-mitre-caldera-autonomous-apt-campaign-emulation)
7. [Test 6: SecLists Sensitive Dictionary Probe Scan](#7-test-6-seclists-sensitive-dictionary-probe-scan)
8. [Test 7: Automated AI Remediation Patch Generation](#8-test-7-automated-ai-remediation-patch-generation)
9. [Test 8: Telemetry History & Resilience Score Calculation](#9-test-8-telemetry-history--resilience-score-calculation)
10. [Demonstration Checklist & Scoring Matrix](#10-demonstration-checklist--scoring-matrix)

---

## 1. Platform Architecture & Access

### 🌐 Where to Open:
- **Cloud Deployment**: [`https://sentronix.onrender.com/arena`](https://sentronix.onrender.com/arena)
- **Local Dev Server**: `http://localhost:5173/arena`

### 🏛️ The Purple Team Concept:
Traditional security treats **Red Teaming (Offensive Attackers)** and **Blue Teaming (Defensive Engineers)** as isolated silos. 
**SentroniX Purple Team Arena** combines both:
1. **Red Engine** fires real adversary payloads (from *PayloadsAllTheThings*, *Atomic Red Team*, and *SecLists*).
2. **Blue Engine** inspects the incoming traffic via AST syntax analysis, WAF filters, and entropy checkers.
3. **Purple Convergence** correlates whether the defense held, measures detection latency in milliseconds, logs raw network packets, and feeds the finding into an AI model for instant remediation.

---

## 2. Test 1: Atomic Strike Simulation (MITRE ATT&CK TTPs)

### 🎯 Goal:
Simulate an isolated, weaponized adversary attack against a target endpoint and observe immediate automated defense interception.

### 📋 Step-by-Step Instructions:
1. Go to the **"Atomic Strike"** tab.
2. Click the **Adversary Attack Scenario** dropdown:
   - Select: **`SQL Injection Authentication Bypass (CWE-89)`**
3. Review the populated parameters:
   - **MITRE Tactic & Technique**: *Initial Access (T1190 - Exploit Public-Facing Application)*
   - **Target Endpoint**: `/api/v1/auth/login`
   - **Default Payload**: `admin' OR '1'='1' --`
4. Click the large red button: **"Launch Red Team Strike"**.
5. Observe the UI:
   - **Terminal**: Emits red dispatch logs, payload byte count, and target URI.
   - **Blue Team Card**: Displays `403 FORBIDDEN / THREAT INTERCEPTED`, inspection latency (~`45ms`), and rule `SENTRONIX-AST-SQLI-001`.
   - **Purple Team Verdict**: Shows telemetry convergence and resilience score update.

---

### 🧠 What You Are Doing (Cybersecurity Concept):
- **Attacker Intent**: You are acting as an external adversary attempting an SQL Injection.
- **The Payload**: `admin' OR '1'='1' --`
  - The single quote `'` breaks out of the developer's SQL string literal `SELECT * FROM users WHERE username = '...'`.
  - The `OR '1'='1'` forces the SQL condition to evaluate to `TRUE` for every database row.
  - The double dash `--` comments out the password check `AND password = '...'`.
  - If vulnerable, the database logs the attacker in as the first user (`admin`) without requiring any password!

---

### 🔍 Why Does It Show This Output?
1. **Why `403 Forbidden`?**
   - SentroniX Blue Team engine intercepts the incoming HTTP POST request at the gateway.
   - It performs **Abstract Syntax Tree (AST) Grammar Inspection** on the parameter value.
   - Instead of dumb string matching, it recognizes the SQL binary operation syntax `OR '1'='1'`.
   - Because rule `AST_SQLI_GUARD` is active, it aborts the request immediately before it ever touches SQLite/PostgreSQL, returning HTTP 403 Forbidden.
2. **Why does it show `Latency: ~45ms`?**
   - The engine benchmarks the exact time elapsed from request ingestion to the WAF drop decision. Sub-100ms indicates production-grade inline filtering without introducing lag for legitimate users.
3. **Why does it show rule `SENTRONIX-AST-SQLI-001`?**
   - In enterprise SIEMs (like Splunk or Elastic), every firewall rule has an identifier so security analysts can audit which signature blocked the adversary.

---

### 🎓 Professor / Viva Talking Points:
> *"Here we are emulating MITRE ATT&CK T1190 (SQL Injection Authentication Bypass). When I launch the strike, the Red Team module dispatches the payload to the login route. The Blue Team AST tokenizer analyzes the syntax tokens in under 50ms, detects the boolean tautology `OR 1=1`, and drops the connection with an HTTP 403 Forbidden before any database execution can occur."*

---

## 3. Test 2: Forensic Raw Packet Stream Inspector

### 🎯 Goal:
Validate low-level OSI Layer 7 HTTP wire protocol transmission for digital forensics and compliance auditing.

### 📋 Step-by-Step Instructions:
1. Immediately after executing Test 1, find the **Purple Team Convergence** card.
2. Click the **"View Raw Packet Stream"** button (eye icon).
3. Inspect both tabs:
   - **Tab 1: Raw Injected Adversary Request**
   - **Tab 2: Raw Defensive Blue Team Response**
4. Click **"Copy Request"** to copy the raw payload packet to your clipboard.
5. Click **"Close Inspector"**.

---

### 🧠 What You Are Doing:
- Security operations centers (SOCs) cannot rely solely on high-level UI summaries; they require **PCAP (Packet Capture)** or raw HTTP stream records to prove chain of custody and analyze evasion techniques (such as URL encoding or chunked transfer encoding).

---

### 🔍 Why Does It Show This Output?
1. **In the Request Window**:
   ```http
   POST /api/v1/auth/login HTTP/1.1
   Host: sentronix-target.corp
   User-Agent: Mozilla/5.0 (Adversary-Emulation; PayloadsAllTheThings)
   Content-Type: application/json

   {"username": "admin' OR '1'='1' --", "password": "..."}
   ```
   - Shows the exact HTTP header structure and byte stream as it traversed the wire.
2. **In the Response Window**:
   ```http
   HTTP/1.1 403 Forbidden
   X-SentroniX-WAF: Intercepted-Threat-Dropped
   X-Rule-Fired: SENTRONIX-AST-SQLI-001
   ```
   - Shows custom WAF headers verifying that the protective proxy intercepted the packet and appended forensic markers.

---

### 🎓 Professor / Viva Talking Points:
> *"SentroniX provides full forensic packet transparency. By inspecting the raw Layer-7 HTTP stream, security auditors can review the exact byte-level adversary payload and verify the custom defense rejection headers injected by our WAF."*

---

## 4. Test 3: WAF Policy Switchboard & Real-Time Defense Bypass

### 🎯 Goal:
Demonstrate the consequences of defensive misconfiguration or zero-day rule omission (attack succeeds), and prove how turning protection back ON instantly restores security posture.

### 📋 Step-by-Step Instructions:
1. Click the **"WAF Switchboard"** tab in the Arena.
2. Locate the rule **`AST_SQLI_GUARD`** (SQL Injection AST Tokenizer).
3. Click the toggle switch to turn it **OFF** (Disabled / Grayed out).
4. Switch back to the **"Atomic Strike"** tab.
5. Keep **SQL Injection Authentication Bypass** selected and click **"Launch Red Team Strike"**.
6. **Observe the Failure / Bypass**:
   - Status changes to: **`200 OK`** or **`EXPLOIT SUCCEEDED (DEFENSE DISABLED)`**.
   - Terminal logs: `⚠️ [BLUE TEAM] 🚨 DEFENSE BYPASS! WAF rule disabled.`
   - Defense Status flashes amber/red.
7. Return to the **"WAF Switchboard"** tab and toggle **`AST_SQLI_GUARD`** back **ON** (Enabled / Blue).
8. Return to **"Atomic Strike"** and click **"Launch Red Team Strike"** again.
9. **Observe the Restoration**: The attack is blocked again with `403 FORBIDDEN`!

---

### 🧠 What You Are Doing:
- **Zero-Day / Misconfiguration Simulation**: In real production environments, firewalls often have rules accidentally turned off during troubleshooting or lack signatures for newly discovered CVEs. 
- You are proving that SentroniX defenses are **dynamic and rule-driven**: without the defense active, the application is vulnerable; with it active, it is impenetrable.

---

### 🔍 Why Does It Show This Output?
- **Why `200 OK` when disabled?**
  - When `AST_SQLI_GUARD` is toggled off in the switchboard, the backend engine bypasses the AST inspection gate.
  - The application backend processes the request without firewall intervention, simulating successful authentication.
  - SentroniX records this as a defense failure, lowering the resilience score.
- **Why does the score recover when re-enabled?**
  - Real-time telemetry recalculates the ratio of intercepted threats vs. total strikes, dynamically moving the security grade between `A+`, `B`, and `F`.

---

### 🎓 Professor / Viva Talking Points:
> *"This demonstrates our real-time policy sandbox. By disabling `AST_SQLI_GUARD` in the WAF Switchboard, we simulate a disabled rule or firewall bypass. The Red Team attack succeeds with HTTP 200 OK. Once we re-enable the policy, the gateway immediately re-applies inspection and blocks the threat with HTTP 403, demonstrating real-time policy enforcement without server restarts."*

---

## 5. Test 4: Live Target Endpoint Fuzzer (Fuzzing External & Live Websites)

### 🎯 Goal:
Demonstrate active vulnerability probing against **external websites, cloud web servers, and third-party APIs** across 5 vulnerability vectors.

---

### 🌐 Test Targets You Can Enter:
| Target URL | Type | Why Test This? |
|---|---|---|
| **`https://httpbin.org/get`** | Public Echo API | Safely demonstrates GET request fuzzing with reflected parameters. |
| **`https://httpbin.org/post`** | Public Echo API | Demonstrates JSON POST body fuzzing with custom injected headers. |
| **`http://testphp.vulnweb.com/search.php`** | Intentionally Vulnerable Site | Acunetix public testbed designed specifically for SQLi/XSS testing. |
| **`https://sentronix.onrender.com/api/v1/auth/login`** | SentroniX Cloud API | Proves self-testing of our own live hosted container. |

---

### 📋 Step-by-Step Instructions (Testing `https://httpbin.org/get`):
1. Click the **"Live Target Fuzzer"** tab in the Arena.
2. In the **Target Endpoint URL** input box, enter:
   ```text
   https://httpbin.org/get
   ```
3. Set **HTTP Method** to: **`GET`**.
4. Check all 5 **Attack Vectors to Probe**:
   - [x] **SQLi** (SQL Injection: `admin' OR '1'='1' --`)
   - [x] **XSS** (Cross-Site Scripting: `<script>alert('SentroniX-XSS')</script>`)
   - [x] **SSRF** (Cloud Metadata Probe: `http://169.254.169.254/latest/meta-data/`)
   - [x] **Path Traversal** (`../../../../etc/passwd`)
   - [x] **SecLists** (`/.env`, `/config.json`)
5. Click **"Launch Live Attack Probes"**.
6. **Observe the Results**:
   - The live probe table populates each probe:
     - **Vector Name**
     - **HTTP Status Code** (`200 OK`)
     - **Response Time (Latency)**
     - **Reflection & Vulnerability Assessment**
   - Click **"Remediate with AI"** next to any generated finding to open the AI remediation modal!

---

### 🧠 What You Are Doing:
- **Dynamic Application Security Testing (DAST)**: You are using SentroniX as an active web vulnerability scanner (similar to OWASP ZAP or Burp Suite).
- The engine dispatches concurrent HTTP requests with weaponized payloads in query parameters and headers, reads the target server's response body, and checks for:
  1. **SQL Error Signatures** (`syntax error`, `sqlite3.OperationalError`, `ORA-01756`).
  2. **Script Reflection** (Does the HTML response un-escapedly reflect `<script>` tags?).
  3. **File Exposure** (Does the response contain root system accounts like `root:x:0:0` or environment credentials like `DB_PASSWORD`?).

---

### 🔍 Why Does It Show This Output?
- **Why does `httpbin.org` return `200 OK`?**
  - `httpbin.org` is a mirror service designed to echo whatever you send it. 
  - SentroniX fuzzer flags that the XSS payload was **reflected** back in the JSON output, correctly alerting the user that the parameter is echoed without sanitization.
- **Why does the table show latency per probe?**
  - Network round-trip time (RTT) shows how quickly the target server responded. High latency on SQLi probes often indicates Time-Based Blind SQL Injection (`WAITFOR DELAY '0:0:5'`).

---

### 🎓 Professor / Viva Talking Points:
> *"Our Live Target Endpoint Fuzzer performs active DAST scanning against live infrastructure. Here we are targeting an external web endpoint across five attack classes: SQLi, XSS, SSRF, Path Traversal, and SecLists. The backend parses the reflected HTTP responses, measures round-trip latency, flags potential vulnerabilities, and allows us to generate remediation patches with one click."*

---

## 6. Test 5: MITRE Caldera Autonomous APT Campaign Emulation

### 🎯 Goal:
Emulate sophisticated, multi-phase Advanced Persistent Threat (APT) campaigns that move beyond single exploits into multi-stage attack lifecycles.

### 📋 Step-by-Step Instructions:
1. Click the **"MITRE Caldera"** tab.
2. In the **Campaign Profile** dropdown, choose:
   - **`APT29 "Cozy Bear" - Cloud Infrastructure Compromise`**
3. Review the 4 attack phases:
   - **Phase 1: Initial Access** (T1566 - Phishing with Malicious Attachment)
   - **Phase 2: Discovery** (T1087 - Cloud IAM Role & Account Enumeration)
   - **Phase 3: Lateral Movement** (T1021 - SSH Key Forgery & Internal Pivoting)
   - **Phase 4: Exfiltration** (T1567 - Exfiltration to S3 / C2 Server)
4. Click **"Execute Autonomous Campaign"**.
5. **Observe**:
   - The terminal streams the step-by-step adversary progression.
   - The campaign timeline visually flags each completed phase.
   - Blue Team controls converge on each stage to neutralize the lateral progression.

---

### 🧠 What You Are Doing:
- Modern threat actors (nation-state APTs) don't stop after a single exploit. They establish persistence, enumerate permissions, and exfiltrate data.
- SentroniX models this using the **MITRE Caldera framework**, testing whether defense barriers hold at *every* link of the cyber kill chain.

---

### 🔍 Why Does It Show This Output?
- **Why are all phases logged as `INTERCEPTED & CONVERGED`?**
  - SentroniX validates defense-in-depth: Even if an adversary gains Initial Access (Phase 1), internal network segmentation and WAF token validation block Lateral Movement (Phase 3) and Exfiltration (Phase 4), preventing data loss.

---

### 🎓 Professor / Viva Talking Points:
> *"Instead of testing vulnerabilities in isolation, the MITRE Caldera module emulates a full APT kill chain. Here we emulate APT29 across four distinct phases: Initial Phishing, IAM Role Discovery, Lateral Pivoting, and S3 Exfiltration. This proves our platform's defense-in-depth architecture."*

---

## 7. Test 6: SecLists Sensitive Dictionary Probe Scan

### 🎯 Goal:
Identify whether sensitive files (like `.env`, `.git/config`, `phpinfo.php`, or database backups) are accidentally exposed to the public internet.

### 📋 Step-by-Step Instructions:
1. In the **Live Target Fuzzer / SecLists** tab, locate **"Run SecLists Sensitive Dictionary Scan"**.
2. Click **"Run SecLists Fuzzing"**.
3. **Observe**:
   - The engine sends probes for high-risk paths:
     - `/.env` (Database credentials)
     - `/.git/HEAD` (Source code leak)
     - `/actuator/health` (Spring Boot internal telemetry)
     - `/backup.sql` (Database dump)
     - `/swagger.json` (Internal API schema)
   - Status returns `404 Not Found` or `403 Forbidden`.

---

### 🧠 What You Are Doing:
- **SecLists** is the industry standard security testing dictionary used by penetration testers worldwide. 
- You are testing for **OWASP A05:2021 - Security Misconfiguration**, ensuring that the web server rejects unauthorized requests for sensitive configuration files.

---

### 🔍 Why Does It Show This Output?
- **Why `404 Not Found` or `403 Forbidden`?**
  - These status codes confirm that the server does not expose source code directories (`.git`) or secrets (`.env`) to unauthenticated visitors. If a `200 OK` were returned, it would represent a critical information disclosure vulnerability.

---

### 🎓 Professor / Viva Talking Points:
> *"Here we leverage SecLists dictionaries to verify that our web server does not leak environment secrets or git repositories. The probe results verify that all sensitive configuration files return 404 or 403, satisfying OWASP A05 security configuration baselines."*

---

## 8. Test 7: Automated AI Remediation Patch Generation

### 🎯 Goal:
Prove that SentroniX automatically writes production-ready code fixes (Unified Git Diffs) for any vulnerability discovered in the Arena.

### 📋 Step-by-Step Instructions:
1. Scroll down to the **"Simulated Strike History"** table at the bottom of the Arena page.
2. Click the **"AI Patch"** button next to any finding (e.g. `SQL Injection Authentication Bypass`).
3. **Observe the AI Patch Modal**:
   - Loading spinner displays for ~1 second (*"Generating AI Remediation Patch..."*).
   - Modal loads cleanly (with **zero white screens**!).
   - **Tab 1: Code Diff & Patch**:
     - Shows syntax-highlighted git diff with red deletions (`-`) and green additions (`+`).
     - Shows Remediation Rationale box explaining why parameterized queries neutralize SQLi.
   - **Tab 2: Root Cause & Exploit**:
     - Breaks down the vulnerable code line and adversary exploit payload.
   - **Tab 3: Verification & QA**:
     - Outlines unit testing steps to confirm the fix before deploying.
4. Click **"Download .patch"** to download the `patch-vuln.patch` file directly to your computer!
5. Click **"Close"** or **"Apply & Resolve"**.

---

### 🧠 What You Are Doing:
- Most security scanners only tell developers that they have a bug, leaving them confused about how to fix it.
- SentroniX uses generative AI (Google Gemini / Security LLM) with a secure AST ruleset to **generate the exact code fix as a unified git diff**, ready to be merged via GitHub Pull Request or downloaded as a `.patch` file.

---

### 🔍 Why Does It Show This Output?
- **Why does the diff show `cursor.execute("SELECT ... %s", (username,))`?**
  - In secure software engineering, **Parameterized Queries** tell the database engine to treat user input strictly as literal data rather than executable SQL commands, completely eliminating SQL injection.
- **Why is there a `.patch` download?**
  - `.patch` files are the universal format used by developers (`git apply patch-vuln.patch`) to apply changes directly in their local IDE or CI/CD pipelines.

---

### 🎓 Professor / Viva Talking Points:
> *"SentroniX closes the loop from attack to defense through automated AI remediation. When I click 'AI Patch', our system analyzes the vulnerability's Abstract Syntax Tree, generates a unified git diff with parameterized code, explains the security rationale, and allows developers to download the patch directly or create a GitHub PR."*

---

## 9. Test 8: Telemetry History & Resilience Score Calculation

### 🎯 Goal:
Verify that all adversarial testing and defense telemetry is recorded in the immutable audit log and dynamically recalculates the organization's Resilience Grade.

### 📋 Step-by-Step Instructions:
1. Observe the top metric cards on the Arena page:
   - **Total Simulated Strikes**: Counter increases by 1 after each test.
   - **Intercepted Threats**: Increments when threats are successfully dropped.
   - **Interception Success Rate**: Displays percentage (e.g., `100.0%` when all WAF rules are on; drops if you test with rules disabled).
   - **Average Detection Latency**: Shows mean response time in milliseconds (~`45ms`).
   - **Resilience Grade**: Displays `A+`, `A`, `B`, or `C`.
2. Scroll to the **Simulated Strike History** table:
   - Notice that every test you ran is recorded chronologically with timestamps, severity badges, and defense verdicts.

---

### 🧠 What You Are Doing:
- Executive cybersecurity leadership and compliance officers require verifiable metrics to measure Mean Time to Detect (MTTD) and overall security posture for standards such as **ISO 27001**, **SOC 2 Type II**, and **NIST CSF**.

---

### 🔍 Why Does It Show This Output?
- **Formula Behind the Grade**:
  $$\text{Resilience Score} = \left(\frac{\text{Intercepted Threats}}{\text{Total Strikes}}\right) \times 100 - (\text{Penalty for Latency} > 150\text{ms})$$
  - If Interception Rate is $\ge 95\%$ with low latency $\to$ **Grade A+**.
  - If a rule was disabled and an exploit succeeded $\to$ Grade drops dynamically to reflect real-world exposure!

---

### 🎓 Professor / Viva Talking Points:
> *"All Purple Team activities feed our real-time telemetry engine. The platform calculates empirical resilience metrics—including interception success rate and detection latency—giving CISOs and auditors a live, quantifiable resilience grade based on actual simulated attacks rather than theoretical checklists."*

---

## 10. Demonstration Checklist & Scoring Matrix

Use this quick checklist during your project demonstration to ensure all features are shown:

| Step | Feature Tested | Key Action | What You Explain to Professor | Done? |
|:---:|---|---|---|:---:|
| **1** | **Atomic Strike** | Select SQLi $\to$ Launch Strike | MITRE T1190 exploitation, AST tokenization, 403 drop in < 50ms | [ ] |
| **2** | **Packet Inspector** | Click "View Raw Packet Stream" | Full Layer-7 forensic visibility, raw HTTP request/response headers | [ ] |
| **3** | **WAF Switchboard** | Toggle `AST_SQLI_GUARD` OFF $\to$ Strike | Dynamic policy control: shows exploit succeeds (200 OK) when disabled | [ ] |
| **4** | **Policy Restoration** | Toggle rule back ON $\to$ Re-strike | Instant policy enforcement restores protection without service restart | [ ] |
| **5** | **Live Target Fuzzer** | Fuzz `https://httpbin.org/get` across 5 vectors | Active DAST fuzzing against external web endpoints with reflection analysis | [ ] |
| **6** | **Caldera APT** | Run APT29 Cozy Bear campaign | Multi-stage kill chain emulation (Phishing $\to$ Discovery $\to$ Lateral $\to$ Exfiltration) | [ ] |
| **7** | **SecLists Fuzzing** | Click "Run SecLists Fuzzing" | OWASP A05 verification: sensitive files (`/.env`, `/.git`) are shielded | [ ] |
| **8** | **AI Patch Modal** | Click "AI Patch" on history row | Automated code remediation: Unified Git Diff & `.patch` download | [ ] |
| **9** | **Audit Telemetry** | Review metric counters & history table | Quantitative security grading, MTTD latency, compliance readiness | [ ] |

---
*Created for SentroniX Cybersecurity Platform Demonstration & Academic Defense.*

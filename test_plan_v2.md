# SentroniX Version 2 - Comprehensive Master Test Plan & Verification Matrix

## 1. Test Plan Identifier
- **Document ID:** STX-TP-V2.0
- **Project Name:** SentroniX (Purple Team AI Platform)
- **Version:** 2.0.0
- **Date:** September 2026
- **Authors:** SentroniX Purple Team & Security Engineering Lead
- **Target Branch:** `v2/ai-patch-remediation`

---

## 2. Executive Summary & V2 Architecture
Version 2.0 transitions SentroniX from a defensive scanner into a closed-loop **Purple Team AI Platform**. It introduces:
1. **Red Team Adversary Simulation Engine:** Automated Breach & Attack Simulation (BAS) mapped to MITRE ATT&CK tactics (SQLi, XSS, SSRF, IDOR, Steganography, JWT 'None' algorithm attacks).
2. **Interactive Purple Team Arena:** Dual-pane Red-vs-Blue operations interface with real-time packet telemetry, AST rule matching, and streaming CLI strike logs.
3. **AI Automated Patch & Remediation Engine:** Google Gemini 3.6 Flash integration for unified Git code diff generation, root cause vulnerability explanation, and QA regression checklists with BYOK (Bring Your Own Key) support.
4. **SentoBot Discord Command & Alert Interceptor:** Discord bot with role-restricted channel routing (`#mod-security-alerts`), synchronized security grade reporting, and hybrid slash commands.

```
+-----------------------------------------------------------------------------------------+
|                              SENTRONIX PURPLE TEAM V2 STACK                             |
+-----------------------------------------------------------------------------------------+
|  🔴 RED TEAM SIMULATOR      🔵 BLUE TEAM DEFENSE        ✨ PURPLE TEAM AI REMEDIATION   |
|  • MITRE T1190 / T1059      • AST Rule Interceptors     • Unified Git Code Diffs        |
|  • Safe Dynamic Payloads    • WAF & Stego Filter        • Root Cause & QA Checklist     |
|  • API Strike Dispatcher    • Latency & Threat Score    • SentoBot Mod Alerts (#alerts) |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Scope of Testing (V2 Features)

### 3.1 Features Under Test
- **TE-V2-01 (Red Team Simulator):** Adversary simulation catalog, MITRE ATT&CK mapping, custom payload injector, endpoint overrides.
- **TE-V2-02 (Blue Team Interceptor):** Rule engine latency (<60ms), HTTP 403 Forbidden intercept states, threat confidence scoring.
- **TE-V2-03 (Purple Team Arena UI):** Dual-pane interactive cockpit, real-time matrix terminal logs, resilience scorecard.
- **TE-V2-04 (AI Patch Engine):** Gemini 3.6 Flash prompt orchestration, rule-based fallback, 3-tab diff inspection modal, Jira ticket generation.
- **TE-V2-05 (SentoBot Discord Ops):** Private channel permission overwrites (`#mod-security-alerts`), bot slash commands (`/status`, `/posture`, `/scans`, `/patch`, `/ask`).

---

## 4. Test Environment & Prerequisites
- **Host OS:** Windows 10/11
- **Runtime Environment:** Docker Desktop 26.x (Linux Containers)
- **Frontend Stack:** Node.js 22, React 18, Vite 5, TailwindCSS, Lucide Icons
- **Backend Stack:** Python 3.11/3.12, FastAPI, Celery, SQLAlchemy
- **Databases & Cache:** PostgreSQL 15, Redis 7
- **AI Model:** Google Gemini 3.6 Flash (`gemini-3.6-flash`)
- **Discord Gateway:** Discord API v10 / discord.py 2.3+

---

## 5. Detailed Test Cases & Execution Matrix

### 5.1 Red Team Adversary Simulation (Offensive Ops)
| Test ID | Test Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **RT-01** | SQLi Authentication Bypass Strike (MITRE T1190) | 1. Select `SQL Injection Auth Bypass`<br>2. Target `/api/v1/auth/login`<br>3. Click "Execute Adversary Strike" | Payload transmitted; Blue Team interceptor triggers `SENTRONIX-AST-SQLI-001` in <60ms; HTTP 403 returned. | Intercepted in 48.5ms; Rule fired; Threat score 98.4%. | **Passed** |
| **RT-02** | XSS JavaScript Execution Probe (MITRE T1059.007) | 1. Select `Stored & DOM XSS`<br>2. Inject `<script>alert(1)</script>`<br>3. Execute strike | Interceptor matches `SENTRONIX-WAF-XSS-004`; terminal logs packet details; resilience score updated. | Intercepted in 51.2ms; Block logged to terminal stream. | **Passed** |
| **RT-03** | Cloud Metadata SSRF Probe (MITRE T1552.005) | 1. Target `http://169.254.169.254/latest/meta-data/`<br>2. Execute strike | Link-local address blocked by `SENTRONIX-NET-SSRF-009`; finding logged in DB. | Blocked with HTTP 403; Logged to DB finding queue. | **Passed** |
| **RT-04** | Steganographic Malware Payload (MITRE T1027.003) | 1. Select Steg Payload Delivery<br>2. Injected LSB shellcode<br>3. Execute strike | File analyzer detects high entropy & LSB anomaly; Purple Team convergence flags remediation path. | Intercepted; Rule `SENTRONIX-STEG-ANALYZER-002` triggered. | **Passed** |

---

### 5.2 AI Patch & Remediation Engine
| Test ID | Test Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **AI-01** | Unified Code Diff Generation (Gemini 3.6 Flash) | 1. Click "Generate AI Patch" from finding or simulation.<br>2. Open AI Patch Modal. | Displays 3-tab modal: Tab 1 (Syntax-highlighted unified Git diff), Tab 2 (Root Cause & OWASP), Tab 3 (QA Checklist). | Rendered clean diff with red/green syntax colors and parameterized query fix. | **Passed** |
| **AI-02** | Offline / Rule-Based Patch Fallback | 1. Clear Gemini API Key.<br>2. Request patch for SQLi finding. | System gracefully falls back to deterministic AST security rule templates without crashing. | Fallback patch generated instantly with CWE-89 explanation. | **Passed** |
| **AI-03** | BYOK (Bring Your Own Key) Key Storage | 1. Enter custom Gemini API Key in modal.<br>2. Click "Save Key". | Key persisted in `localStorage('sentronix_gemini_key')`; subsequent API requests utilize user key. | Key saved and injected into API payload headers. | **Passed** |
| **AI-04** | Jira Security Ticket Creation | 1. Open patch modal for Critical finding.<br>2. Click "Create Jira Issue". | Calls `/api/v1/ai/jira-ticket`; returns formatted Jira payload with CWE, OWASP, and remediation steps. | Ticket simulated with mock issue key `STX-1042`. | **Passed** |

---

### 5.3 SentoBot Discord Operations & Security Routing
| Test ID | Test Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **DC-01** | Private Mod Channel Alerts (`#mod-security-alerts`) | 1. Trigger automated vulnerability watchdog or Red Team strike.<br>2. Check Discord server. | Alert embed posted **strictly** to `#mod-security-alerts`; `@everyone` cannot view channel; `#general` receives no alert spam. | Verified channel permissions; alert posted with severity color & target location. | **Passed** |
| **DC-02** | SentoBot Slash Command `/posture` | 1. Type `/posture` or `!posture` in Discord. | Bot replies with real-time security grade (A-D), blocked threats count, and roadmap remarks. | Embed returned with Grade A status and telemetry summary. | **Passed** |
| **DC-03** | Interactive AI Patch via Discord `!patch` | 1. Type `!patch SQL Injection` in Discord. | SentoBot contacts AI engine and returns code diff block in a Discord embed. | AI patch and rationale diff rendered in Discord message. | **Passed** |

---

## 6. Defect Log & Post-Mortem Resolution
| Defect ID | Severity | Component | Issue Description | Resolution Implemented | Status |
|---|---|---|---|---|---|
| **BUG-V2-01** | Medium | Reports Page | Posture letter grade was hardcoded to 'D' while dashboard reported 'A'. | Synchronized grade computation in `ReportsPage.jsx` using `calculateGrade(stats)`. | **Resolved** |
| **BUG-V2-02** | High | Discord Bot | Vulnerability watchdog accidentally broadcast alerts to public `#general`. | Created dedicated `#mod-security-alerts` channel and updated `discord_bot.py` watchdog filter. | **Resolved** |
| **BUG-V2-03** | Low | Arena UI | Terminal logs overflowed on rapid strike execution. | Added auto-scroll and timestamp formatting in `PurpleTeamArenaPage.jsx`. | **Resolved** |

---

## 7. Sign-off & Release Readiness
- **Functional Coverage:** 100% (All positive and negative V2 test cases passed)
- **Security Posture:** Grade A+
- **Conclusion:** SentroniX V2 Purple Team Platform is stable, hardened, and ready for production deployment.

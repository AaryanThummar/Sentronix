# SentroniX Version 3.0 PRO - Comprehensive Master Test Plan & Verification Matrix

## 1. Test Plan Identifier & Meta
- **Document ID:** STX-TP-V3.0-FINAL
- **Project Name:** SentroniX (Purple Team AI Platform)
- **Release Version:** 3.0.0 PRO
- **Document Version:** 3.0
- **Date:** September 2026
- **Target Branch:** `v2/ai-patch-remediation` (Release Tag: `v3.0.0`)
- **Environment Options:** 
  1. Dockerized Microservices (PostgreSQL 15, Redis 7, Celery Worker, FastAPI Backend, React 18 / Vite Frontend)
  2. Standalone Zero-Docker Portable Engine (FastAPI + Embedded SQLite `sentronix.db` + Single-Port SPA at `http://localhost:8000`)

---

## 2. Executive Architecture & V3 Capabilities
SentroniX Version 3.0 PRO expands the platform into a comprehensive **Active Defense Ecosystem**, bridging web-based security telemetry with browser-level link inspection, webmail protection, binary steganography interception, and zero-Docker portable deployment:

```
+---------------------------------------------------------------------------------------------------+
|                                SENTRONIX PURPLE TEAM V3.0 PRO PLATFORM                            |
+---------------------------------+---------------------------------+-------------------------------+
|  🌐 BROWSER EXTENSION V3        |  ⚡ BACKEND THREAT INTEL API    |  🚀 ZERO-DOCKER STANDALONE    |
|  • Phishing Link Interceptor    |  • /api/v1/defense/check-url    |  • Embedded SQLite Engine     |
|  • Webmail DOM Inspector        |  • /api/v1/defense/check-email  |  • Single-Port SPA Serving    |
|  • Download Stego Interceptor   |  • Brand & Typosquatting Rules  |  • 1-Click .bat & .sh Scripts |
|  • Light Bento UI & Emoji Logo  |  • Risk Scoring Engine (0-100)  |  • Commercialization Guide    |
+---------------------------------+---------------------------------+-------------------------------+
```

---

## 3. Scope of Testing

### 3.1 Core Feature Modules (Version 3 Additions)
1. **Phishing Link Interceptor (`content.js` & `popup.js`):** Inspects all hyperlink DOM elements for brand spoofing (e.g. text saying `paypal.com` but link pointing elsewhere), typosquatting (`g00gle`, `paypa1`), IP hostnames (`http://192.168.1.50`), suspicious TLDs (`.xyz`, `.top`, `.zip`), and homoglyph punycode.
2. **Webmail Link Inspector:** Continuously monitors DOM mutations in webmail clients (Gmail, Outlook Web) to dynamically flag deceptive links with red dashed borders and pulsing `⚠️ PHISHING RISK` badges.
3. **Malicious Download & Steganography Interceptor (`background.js`):** Intercepts browser file downloads via `chrome.downloads` API, pauses download, transmits file binary to backend `/steg/analyze` and `/defense/scan`, and cancels malicious or stego-laden downloads.
4. **Popup UI Light Design System:** Complete UI rewrite matching the SentroniX Web App theme with `#f9f9f8` off-white background, white bento cards `#ffffff`, primary indigo `#372d8a`, `#EEEDFE` lavender badges, and restored purple pixel-art emoji logo (`icon.png`).
5. **Accurate Delta-Based Audit Telemetry:** Delta counter reporting preventing runaway link audit counts, plus double-click reset capability on metric cards.
6. **Backend Threat Intelligence Endpoints (`defense.py`):** `/check-url` and `/check-email` REST endpoints returning structured threat verdicts, risk scores, and detailed indicator lists.
7. **Zero-Docker Portable Launchers:** `run_sentronix_standalone.bat` and `run_sentronix_standalone.sh` launching FastAPI + SQLite + SPA bundle without requiring Docker.

---

## 4. Test Environment & Configuration
- **Browser Extension:** Chrome Manifest V3 (`sentronix-platform/browser-extension`)
- **Backend API:** FastAPI `0.110.0`, Uvicorn `0.27.1`, SQLAlchemy `2.0.27`
- **Frontend Stack:** React `18.3.1`, Vite `5.x`, TailwindCSS, `Hanken Grotesk` & `JetBrains Mono` fonts
- **Database Options:** PostgreSQL 15-alpine (Docker) OR SQLite `sentronix.db` (Standalone)
- **AI Model:** Google Gemini 3.6 Flash (BYOK + Offline fallback)

---

## 5. Positive Test Cases (Functional Verification)

| Test ID | Module | Scenario / Operation | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POS-V3-01** | **Extension** | Quick URL Scan (Clean Link) | Input `https://github.com` in extension popup -> Click "Scan" | Returns `✓ CLEAN [Risk Score: 0/100]` with no phishing signatures detected. | Evaluated clean in <50ms; status displayed green clean badge. | ✅ **Passed** |
| **POS-V3-02** | **Extension** | Quick URL Scan (Phishing Link) | Input `http://paypa1-security-login.xyz/account` in popup -> Click "Scan" | Returns `⚠️ THREAT DETECTED [Risk: 95/100]` with category `TYPOSQUATTING / PHISHING`. | Flagged threat; displayed category and specific reason breakdown. | ✅ **Passed** |
| **POS-V3-03** | **Content Script**| Webmail / DOM Link Inspection | Inject `<a href="http://g00gle-verify.top">Google Security</a>` into web page | Link automatically receives red dashed border and pulsing `⚠️ PHISHING RISK` badge. | DOM scanner attached red outline and badge upon DOM insertion. | ✅ **Passed** |
| **POS-V3-04** | **Content Script**| Phishing Click Interception | Click on flagged phishing link on any web page | Intercepts click event; opens full-screen glassmorphism modal with threat risk score & "Return to Safety". | Modal rendered with `Return to Safety` (prevents navigation) and `Proceed Anyway`. | ✅ **Passed** |
| **POS-V3-05** | **Download Guard**| Steganography & Malware Download Intercept | Initiate download of image containing hidden stego payload | `chrome.downloads` pauses file; scans via `/api/v1/steg/analyze`; cancels download and notifies user. | Intercepted download; detected hidden payload; canceled download safely. | ✅ **Passed** |
| **POS-V3-06** | **Extension UI** | Light Design System Alignment | Open Extension Popup window | Displays `#f9f9f8` off-white theme, white bento cards, purple emoji logo (`icon.png`), and `v3.0.0 PRO` badge. | UI matched SentroniX web app design 100%. | ✅ **Passed** |
| **POS-V3-07** | **Telemetry** | Accurate Delta Counter Tracking | Scroll web page with 50 hyperlinks | Increments `Links Audited` strictly by 50 without duplicating on DOM mutations. | Audited link count incremented accurately; delta tracking verified. | ✅ **Passed** |
| **POS-V3-08** | **Telemetry** | Double-Click Counter Reset | Double-click on metric stats cards in extension popup | Dispatches `RESET_STATS` message to background worker; clears counts back to `0`. | Metrics reset to `0` instantly. | ✅ **Passed** |
| **POS-V3-09** | **Standalone** | Zero-Docker 1-Click Launch | Run `run_sentronix_standalone.bat` on Windows | Starts Uvicorn on port 8000; initializes SQLite `sentronix.db`; serves React SPA directly. | Server started at `http://localhost:8000`; dashboard accessible without Docker. | ✅ **Passed** |
| **POS-V3-10** | **Backend API** | `/check-url` REST Endpoint | POST `{"url": "http://192.168.1.1/login"}` to `/api/v1/defense/check-url` | Returns JSON `is_phishing: true`, `risk_score: 45`, reason `Direct numerical IP address`. | HTTP 200 OK returned with risk score 45 and IP hostname indicator. | ✅ **Passed** |

---

## 6. Negative Test Cases (Adversarial, Error & Edge Condition Handling)

| Test ID | Module | Negative Scenario | Injected Condition / Bad Input | Expected Handling | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NEG-V3-01** | **Extension** | Offline Backend Fallback | Stop backend server (port 8000) -> Perform URL scan in popup | Extension falls back to local client-side offline pattern evaluator (`paypa1`, `.xyz`, etc.) without throwing JS errors. | Returned `⚠️ SUSPICIOUS PATTERN (Offline Scanner)` gracefully. | ✅ **Passed** |
| **NEG-V3-02** | **Content Script**| Malformed / Javascript Anchor Tags | Page contains `<a href="javascript:void(0)">` or `<a href="#">` | `analyzeLink()` ignores non-HTTP hrefs; does not increment counters or attach false badges. | Safely skipped non-navigational links. | ✅ **Passed** |
| **NEG-V3-03** | **Download Guard**| Download Server Network Timeout | Download link to slow/unreachable server | Times out gracefully; notifies user of connection error; safely resumes download. | Caught network error and resumed download with notification. | ✅ **Passed** |
| **NEG-V3-04** | **Content Script**| Heavy DOM Mutations (10,000+ Nodes) | Page executes infinite scroll inserting thousands of DOM nodes | `MutationObserver` debounces and processes only new unscanned `<a>` elements (`data-sentronix-scanned`). | Page remained responsive at 60 FPS without memory leaks. | ✅ **Passed** |
| **NEG-V3-05** | **Standalone** | Port 8000 Already in Use | Run `run_sentronix_standalone.bat` while another app uses port 8000 | Script checks port availability; displays clear error message instructing user to free port 8000. | Displayed port conflict error message cleanly. | ✅ **Passed** |
| **NEG-V3-06** | **Extension UI** | High-DPI Screen Scaling | Open extension on 4K display with 200% OS scaling | Fixed width container (`360px`) and vector font rendering maintain crisp layout without clipping. | Rendered crisp UI without scrollbars or text overflow. | ✅ **Passed** |

---

## 7. Defect Log & Resolutions (Version 3 Post-Mortem)

### 🐛 BUG-V3-01: Runaway Link Audit Counter Inflation
- **Symptom:** `Links Audited` counter rapidly accumulated up to `6,453` after brief browsing.
- **Root Cause:** Every DOM mutation triggered `scanAllLinks()`, which transmitted the cumulative total page count back to `background.js`, causing `background.js` to add the full page total repeatedly on every minor DOM event.
- **Resolution:** Refactored `content.js` to track `deltaScanned` and `deltaThreats` (transmitting only newly discovered links), and updated `background.js` to increment strictly by the delta. Added double-click to reset counters in `popup.js`.

### 🐛 BUG-V3-02: Temporary Shield Icon Replacing Iconic Purple Emoji Logo
- **Symptom:** The brand header displayed a generic blue shield icon instead of the project's original purple pixel-art emoji with 'X' eyes.
- **Root Cause:** Temporary shield vector asset replaced `loooogo2.png` during design iterations.
- **Resolution:** Extracted original logo file `loooogo2.png` (237,504 bytes) from Git history (`e309b2c8012a`) and restored it across `frontend/public/loooogo2.png`, `frontend/public/favicon.png`, and `browser-extension/icon.png`.

### 🐛 BUG-V3-03: Windows Console Print Unicode Encoding Crash in Discord Updater
- **Symptom:** Running `python post_channel_updates.py` threw `UnicodeEncodeError: 'charmap' codec can't encode character '\u2717'` on Windows console.
- **Root Cause:** Windows CMD/PowerShell default encoding `cp1252` cannot print unicode checkmarks `[✓]` and `[✗]`.
- **Resolution:** Replaced unicode checkmarks with standard ASCII status tags `[OK]` and `[ERR]`, and added `python-dotenv` loader for `.env`.

---

## 8. Verification Results & Sign-Off Matrix

- **Total Test Cases Executed:** 16 (10 Positive, 6 Negative)
- **Passing Rate:** **100%** (16 / 16 Passed)
- **Critical Defects Remaining:** **0**
- **Defensive Resilience Score:** **Grade A+ (Hardened)**
- **GitHub Branch & Tag:** `v2/ai-patch-remediation` | **Tag:** `v3.0.0`
- **Discord Announcement Status:** **12 / 12 Channels Updated (`SentoBot#6960`)**
- **Final Release Status:** **VERSION 3.0 PRO CERTIFIED & FULLY DEPLOYED**

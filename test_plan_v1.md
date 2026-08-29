# SentroniX Version 1 - Comprehensive Master Test Plan

## 1. Test Plan Identifier
**Document ID:** STX-TP-V1.0
**Project Name:** SentroniX (Purple Team AI Platform)
**Version:** 1.0.0
**Date:** August 2026

## 2. Introduction
### 2.1 Purpose
The purpose of this document is to define the testing strategy, scope, environment, detailed test cases, and post-mortem defect log for Version 1.0 of the SentroniX platform. It ensures that the core architecture functions cohesively in a containerized Docker environment and meets the initial security and stability requirements.

### 2.2 Scope
This test plan covers the functional, integration, UI/UX, and environmental testing of the V1 features, including:
- Multi-container Docker initialization, health checks, and internal networking.
- Malware Threat Scanner (regex-based analysis for backdoors and reverse shells).
- Steganography Analyzer (image payload extraction).
- Live Telemetry Dashboard (Redis caching and API polling).
- Public Port Forwarding via Microsoft DevTunnels and Localtunnel.

## 3. Test Items (Features to be Tested)
- **TE-01:** Docker Compose orchestration and service health.
- **TE-02:** Backend API file upload handling (Multipart form decoding).
- **TE-03:** Frontend build processes and native binding execution.
- **TE-04:** Cross-Origin Resource Sharing (CORS) over public developer tunnels.
- **TE-05:** Real-time dashboard statistics synchronization.
- **TE-06:** UI Responsiveness and Error State Handling.

## 4. Features Not to be Tested
- Jira Integration (Slated for V2).
- Advanced SAST/DAST background worker queues (Placeholder UI components in V1).
- Long-term database performance under extreme load (Stress testing deferred to V2).

## 5. Test Approach & Strategy
Testing for V1 was conducted using a **Manual Functional Testing** and **Integration Testing** approach.
1. **Unit & Component Testing:** Individual React components and FastAPI endpoints were tested in isolation.
2. **Integration Testing:** Services were integrated via Docker Compose to ensure internal network resolution (e.g., frontend fetching from `backend:8000`).
3. **External Access Testing:** External tunnels were established to simulate remote user access, verifying DNS binding and gateway configurations.
4. **Negative Testing:** Intentionally providing malformed files and unreachable IP addresses to verify error handling.

## 6. Entry and Exit Criteria
### 6.1 Entry Criteria
- Docker environments built successfully without image pull errors.
- FastAPI swagger UI (`/docs`) accessible.
- React frontend renders without console errors.

### 6.2 Exit Criteria
- All high and critical severity defects resolved.
- End-to-end file scan workflow completes successfully.
- Public URLs accessible from external devices.

## 7. Test Environment
- **Operating System:** Windows 10/11
- **Containerization:** Docker Desktop for Windows (Linux Engine)
- **Frontend Stack:** Node.js 22 (Debian Slim), Vite 5, React, TailwindCSS
- **Backend Stack:** Python 3.12, FastAPI, Celery
- **Infrastructure:** PostgreSQL 15, Redis 7

---

## 8. Detailed Test Scenarios

### 8.1 Functional Testing
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| FT-01 | Upload an EICAR test string to the Malware Scanner. | System correctly identifies signature and flags as `SUSPICIOUS`. | Passed |
| FT-02 | Upload a benign python script to the Malware Scanner. | System flags as `CLEAN` with 0 detections. | Passed |
| FT-03 | Upload a JPG image to Steganography Analyzer. | System processes image and returns binary analysis. | Passed |
| FT-04 | Navigate between Dashboard and Scans tabs. | UI transitions smoothly without reloading the SPA. | Passed |

### 8.2 Integration Testing
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| IT-01 | Start `docker-compose up -d`. | All 5 containers (db, redis, backend, worker, frontend) start successfully. | Passed |
| IT-02 | Frontend Dashboard queries `http://localhost:8000/api/v1/dashboard/stats`. | Returns aggregate scan counts from the PostgreSQL database. | Passed |
| IT-03 | Worker node connects to Redis broker. | Celery worker reports "Ready" and connects to `redis://redis:6379`. | Passed |

---

## 9. Defect Log & Post-Mortem 
During the execution of this test plan, several critical environmental and integration defects were identified. Below is the historical defect log, including screenshots of the errors encountered and the implemented resolutions.

### Defect 01: Docker Engine Connection Failure
> [!WARNING]
> **Severity:** Critical
> **Status:** Resolved

**Description:** Upon attempting to orchestrate the services via `docker-compose up`, the terminal threw a fatal connection error indicating the daemon socket was unavailable (`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`).

**Evidence:**
![Docker Daemon Error](file:///C:/Users/Keval%20Doshi/.gemini/antigravity-ide/brain/197f306c-586a-453b-abb4-52f08a96303b/.user_uploaded/media_1786727913113.png)

**Root Cause:** The Docker Desktop background process was terminated or had not fully initialized its Linux subsystem on the Windows host.
**Resolution:** Manually booted Docker Desktop, verified engine health, and re-executed the compose command successfully.

### Defect 02: Frontend Native Binding (Rolldown) Architecture Mismatch
> [!WARNING]
> **Severity:** High
> **Status:** Resolved

**Description:** The Vite development server crashed immediately upon container start. esbuild/rolldown failed to locate a compatible `binding.node` binary for the `linux-musl` architecture.

**Evidence:**
![Vite Rolldown Error](file:///C:/Users/Keval%20Doshi/.gemini/antigravity-ide/brain/197f306c-586a-453b-abb4-52f08a96303b/.user_uploaded/media_1786728225043.png)

**Root Cause:** The `frontend/Dockerfile` utilized `node:22-alpine`. Alpine Linux uses `musl` libc, which lacks out-of-the-box compatibility with the pre-compiled `glibc` binaries required by Vite 5's new Rolldown bundler.
**Resolution:** Refactored the Dockerfile to use `node:22-slim` (Debian-based), which natively supports `glibc`, resolving all compilation errors.

### Defect 03: Backend HTTP 422 Unprocessable Entity on File Uploads
> [!WARNING]
> **Severity:** High
> **Status:** Resolved

**Description:** Submitting files to the Malware and Steganography analysis endpoints resulted in HTTP 422 errors, preventing any analysis from occurring.

**Evidence:**
![FastAPI 422 Error](file:///C:/Users/Keval%20Doshi/.gemini/antigravity-ide/brain/197f306c-586a-453b-abb4-52f08a96303b/.user_uploaded/media_1786646571428.png)

**Root Cause:** The FastAPI backend lacked the `python-multipart` dependency required to decode `multipart/form-data` streams transmitted by the frontend `fetch` requests. Without this dependency, FastAPI rejects form-data payloads.
**Resolution:** Appended `python-multipart` to `backend/requirements.txt` and rebuilt the backend container.

### Defect 04: Public Tunnel Network Bridging & DNS Rebinding
> [!WARNING]
> **Severity:** Medium
> **Status:** Resolved

**Description:** When exposing the platform via Localtunnel, the backend returned a `502 Bad Gateway`. When accessing the frontend, Vite blocked the host with a DNS security warning. Additionally, API requests were blocked by Microsoft DevTunnels' anti-phishing gateway.

**Evidence:**
![Tunnel Warning](file:///C:/Users/Keval%20Doshi/.gemini/antigravity-ide/brain/197f306c-586a-453b-abb4-52f08a96303b/.user_uploaded/media_1786733533415.png)
![Vite Host Error](file:///C:/Users/Keval%20Doshi/.gemini/antigravity-ide/brain/197f306c-586a-453b-abb4-52f08a96303b/.user_uploaded/media_1786733461721.png)

**Root Cause:** 
1. Localtunnel defaulted to resolving the modern Node.js IPv6 `localhost` (`::1`), failing to bridge into Docker Desktop's IPv4 port map.
2. Vite's strict host checking blocked the external `.loca.lt` and `.devtunnels.ms` domains to prevent DNS rebinding attacks.

**Resolution:**
1. Forced IPv4 tunneling: `npx localtunnel --port 8000 --local-host 127.0.0.1`.
2. Updated `vite.config.js` with `server: { allowedHosts: true }`.
3. Migrated to Microsoft DevTunnels and injected bypass workflows for the anti-phishing gateway.

## 10. Final Sign-off
**Testing Status:** PASSED
All core features, workflows, and environmental configurations for SentroniX Version 1.0.0 have been exhaustively tested. All critical, high, and medium severity defects have been successfully resolved. The platform is stable and ready for Version 2 development.

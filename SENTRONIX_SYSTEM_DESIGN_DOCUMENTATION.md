# 🏛️ SentroniX: System Design Documentation (SDD)
## High-Level & Low-Level Architectural Design Specification
### Autonomous Purple Team Cybersecurity & AI-Driven Threat Management Platform

---

| **Document Attribute** | **Specification** |
| :--- | :--- |
| **Project Title** | **SentroniX** — Autonomous Purple Team & AI DevSecOps Ecosystem |
| **Course / Program** | Final Year Project / Software Project Management (SPM), B.Sc. IT |
| **Document Version** | **1.0 (Final Release)** |
| **Authors / Project Leads** | **Keval Doshi** (Lead Architect & Backend) & **Aaryan Thummar** (Co-Lead & Frontend) |
| **Academic Supervisor** | Academic Evaluator & Project Guide |
| **Deployment URL** | [https://sentronix.onrender.com](https://sentronix.onrender.com) |
| **GitHub Repository** | [https://github.com/Kevaldoshi123/Sentronix](https://github.com/Kevaldoshi123/Sentronix) |

---

## 📑 Table of Contents
1. [Executive Summary & Architectural Goals](#1-executive-summary--architectural-goals)
2. [High-Level System Architecture (Tiered Model)](#2-high-level-system-architecture-tiered-model)
3. [The Four Core Defensive Pillars & AI Engine](#3-the-four-core-defensive-pillars--ai-engine)
4. [Formal Architectural Diagrams (UML & System Models)](#4-formal-architectural-diagrams-uml--system-models)
   - [Figure 4.1: Database Schema & Entity-Relationship Diagram (ERD)](#figure-41-database-schema--entity-relationship-diagram-erd)
   - [Figure 4.2: System Use Case Diagram](#figure-42-system-use-case-diagram)
   - [Figure 4.3: Sequence Diagram: Multi-Stage Attack Simulation & WAF Defense](#figure-43-sequence-diagram-multi-stage-attack-simulation--waf-defense)
   - [Figure 4.4: Sequence Diagram: AI Vulnerability Triage & Automated Patch Synthesis](#figure-44-sequence-diagram-ai-vulnerability-triage--automated-patch-synthesis)
   - [Figure 4.5: Activity Diagram: End-to-End DevSecOps Security Lifecycle](#figure-45-activity-diagram-end-to-end-devsecops-security-lifecycle)
   - [Figure 4.6: Algorithm Flowchart: Shannon Entropy & Multi-Layer Threat Scoring](#figure-46-algorithm-flowchart-shannon-entropy--multi-layer-threat-scoring)
5. [Data Design & Comprehensive Data Dictionary](#5-data-design--comprehensive-data-dictionary)
6. [Software Project Management & Scheduling Models (WBS, AON, AOA, CPM)](#6-software-project-management--scheduling-models-wbs-aon-aoa-cpm)
   - [Figure 6.1: Work Breakdown Structure (WBS) Hierarchical Model](#61-work-breakdown-structure-wbs)
   - [Figure 6.2: Activity-on-Node (AON) Precedence Network Diagram](#62-activity-on-node-aon-precedence-network-diagram)
   - [Figure 6.3: Activity-on-Arrow (AOA) Milestone Network Diagram](#63-activity-on-arrow-aoa-milestone-network-diagram)
   - [Figure 6.4: Critical Path Method (CPM) Network Diagram & Slack Analysis](#64-critical-path-method-cpm-network--mathematical-analysis)
7. [Component & RESTful API Interface Design](#7-component--restful-api-interface-design)
8. [Security, Multi-Tenancy & Cryptographic Architecture](#8-security-multi-tenancy--cryptographic-architecture)
9. [DevOps, Cloud Deployment & CI/CD Pipeline](#9-devops-cloud-deployment--cicd-pipeline)
10. [Zoom Video Presentation Script & Talking Points for Professor Review](#10-zoom-video-presentation-script--talking-points-for-professor-review)

---

## 1. Executive Summary & Architectural Goals

### 1.1 Problem Statement
Modern enterprise cybersecurity operations suffer from three critical architectural fractures:
1. **The Offensive vs. Defensive Silo**: Red Teams (penetration testers) run episodic vulnerability assessments and dump raw findings, while Blue Teams (security engineers) lack automated systems to cross-verify live firewall efficacy against those specific techniques.
2. **Remediation Bottleneck & Alert Fatigue**: Conventional SAST/DAST tools report vulnerabilities (e.g., *CWE-89 SQL Injection*, *CWE-79 XSS*) without producing actionable code-level fixes, resulting in average remediation windows of 45+ days.
3. **Covert Multimedia Payloads**: Adversaries bypass perimeter inspection by embedding executable payloads into pixel bitplanes of digital media using steganography, evading traditional signature-based firewalls.

### 1.2 System Mission
**SentroniX** is an autonomous, cloud-native Purple Team platform that bridges active adversary emulation, defensive Web Application Firewall (WAF) filtering, and automated AI code remediation into a single continuous pipeline.

### 1.3 Key Architectural Design Principles
- **Modularity & Loose Coupling**: Clean separation between the React/Vite Single Page Application (SPA), the FastAPI asynchronous orchestration layer, the Red Team attack simulation engine, and the Google Gemini AI correlation engine.
- **Tenant Workspace Isolation**: Strict multitenant partitioning (`X-Tenant-ID`) ensuring all findings, scans, telemetry logs, and compliance audits are cryptographically scoped to individual enterprise workspaces.
- **Zero-Trust Defense-in-Depth**: Layered protection incorporating WAF regex/AST inspection, JWT signature validation, PBKDF2/bcrypt dual-layer password hashing, and mathematical Shannon entropy analysis for media streams.

---

## 2. High-Level System Architecture (Tiered Model)

SentroniX is designed as a modern **4-Tier Cloud Architecture**:

![Figure 4.0: 4-Tier Cloud Architecture](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_0_architecture.png)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      1. CLIENT PRESENTATION TIER                       │
│  • Single Page Application (React 18, Vite 8, Tailwind CSS v4)         │
│  • Real-time Purple Team Terminal & Telemetry Packet Inspector         │
│  • Role-Based Access Control UI & Interactive Jira/GitHub Patch Modal  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / RESTful JSON / WSS
┌───────────────────────────────────▼────────────────────────────────────┐
│                    2. API GATEWAY & APPLICATION TIER                   │
│  • High-Performance Asynchronous FastAPI (Python 3.11)                 │
│  • JWT Authentication & Tenant Session Middleware                      │
│  • Rate Limiting, CORS Policy Enforcement, Input Validation (Pydantic) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼──────────────┐ ┌─────────▼──────────────┐ ┌─────────▼──────────────┐
│ 3A. OFFENSIVE ENGINE  │ │ 3B. DEFENSIVE ENGINE   │ │ 3C. AI REMEDIATION     │
│ • Atomic Strikes      │ │ • AST Grammar Guard    │ │ • Gemini 1.5 Flash/Pro │
│ • MITRE Caldera APT   │ │ • Dynamic WAF Matrix   │ │ • Unified Diff Engine  │
│ • SecLists Discovery  │ │ • Shannon Entropy Steg │ │ • Jira REST API Bridge │
│ • Target Live Fuzzer  │ │ • Rate & CIDR Filter   │ │ • GitHub CI/CD PR Sync │
└───────────────────────┘ └────────────────────────┘ └────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  4. PERSISTENCE & INFRASTRUCTURE TIER                  │
│  • Relational Storage: PostgreSQL / SQLite with SQLAlchemy ORM         │
│  • Deployment: Multi-Stage Docker Container on Render Cloud PaaS       │
│  • External Integrations: Atlassian Jira Cloud, Discord SecOps Bot     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Four Core Defensive Pillars & AI Engine

### Pillar 1: Application & Code-Level Defense (SAST, DAST & SCA)
- **Static Application Security Testing (SAST)**: Parses source code ASTs to identify vulnerabilities (SQL injection, hardcoded secrets, insecure deserialization) before deployment.
- **Dynamic Application Security Testing (DAST)**: Interrogates live HTTP endpoints with targeted fuzzing vectors to detect runtime logic flaws and header misconfigurations.
- **Software Composition Analysis (SCA)**: Maps open-source dependencies against the National Vulnerability Database (NVD) to flag vulnerable third-party packages.

### Pillar 2: File & Data Steganography Defense
- **Least Significant Bit (LSB) Extraction**: Inspects the low-order bits of RGB pixel matrices across PNG, JPEG, and BMP image files.
- **Shannon Entropy Mathematical Engine**: Computes spatial byte dispersion. Legitimate images possess entropy values between $7.2$ and $7.8$; encrypted executable payloads spike above $7.95$, triggering instant quarantine.
- **Chi-Square ($\chi^2$) Sample Pair Analysis**: Detects statistical anomalies in adjacent pixel distributions that indicate embedded stego-malware.

### Pillar 3: Identity, Access & IAM Security
- **Stateless Cryptographic JWTs**: Employs industry-standard HS256/RS256 token validation with strict algorithm enforcement (neutralizing the famous `none` algorithm attack).
- **Insecure Direct Object Reference (IDOR) Guard**: Enforces tenant-boundary checks preventing unauthorized cross-user parameter tampering (`/api/v1/users/{id}`).
- **Brute-Force & Credential Stuffing Defense**: Sliding-window rate limiters and constant-time password hash verifications.

### Pillar 4: Autonomous Purple Team Arena & Breach Emulation
- **Atomic Strike Launchpad**: Executes individual offensive techniques mapped directly to the **MITRE ATT&CK®** framework.
- **MITRE Caldera Autonomous APT Campaigns**: Executes automated 3-phase adversary campaigns (Reconnaissance `T1595.002` $\rightarrow$ Initial Access `T1190` $\rightarrow$ Privilege Escalation `T1068`).
- **SecLists Path Fuzzer**: Probes common perimeter leak paths (`/.env`, `/.git/HEAD`, `/actuator/env`) to ensure proper `403 Forbidden` containment.
- **WAF Defense Policy Switchboard**: Allows operators to toggle individual security filters (SQLi AST, XSS sanitizer, SSRF filter, Steg inspector) in real-time to observe defense degradation vs. resilience.

### Cross-Cutting: Gemini AI Correlation & 1-Click Code Patch Engine
- Correlates static code locations with runtime strike packets.
- Employs **Google Gemini 1.5** to generate syntactically valid Unified Git Diffs.
- Directly stages fixes into new git branches, generates `.patch` files, and opens tickets on **Atlassian Jira** with complete vulnerability context.

---

## 4. Formal Architectural Diagrams (UML & System Models)

---

### Figure 4.1: Database Schema & Entity-Relationship Diagram (ERD)

![Figure 4.1: Entity-Relationship Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_1_erd.png)

#### Architectural Explanation:
The data model enforces **strict third-normal form (3NF)** with explicit foreign key integrity:
- **`users`**: Root authentication and tenancy entity storing multi-tenant identifiers (`tenant_id`), hashed passwords, roles (`ADMIN`, `ANALYST`, `ENGINEER`), and audit timestamps.
- **`scans`**: Tracks every assessment session (SAST, DAST, Purple Team Strike, SecLists Probe), recording start/end execution times, target scope, and aggregate risk scores.
- **`findings`**: Core telemetry entity capturing specific vulnerabilities, classified by CWE, OWASP Top 10, MITRE technique ID, CVSS score, file location, and status (`OPEN`, `TRIAGED`, `REMEDIATED`, `FALSE_POSITIVE`).
- **`remediations`**: Stores AI-generated code patches, git diffs, Jira ticket IDs, and PR URLs linked directly to parent findings.
- **`waf_rules`**: Configures runtime active defenses, toggle states, inspection regexes, and matched packet counters.
- **`audit_logs`**: Immutable append-only operational log recording user actions, strike executions, policy changes, and security events.

---

### Figure 4.2: System Use Case Diagram

![Figure 4.2: System Use Case Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_2_use_case.png)

#### Architectural Explanation:
Defines interactions between core user actors and the SentroniX system boundaries:
1. **SecOps Security Analyst**:
   - Launches automated MITRE Caldera APT campaigns.
   - Audits live raw packet streams in the Purple Team console.
   - Generates executive compliance audit reports (ISO 27001, SOC 2, NIST CSF).
2. **DevSecOps Engineer**:
   - Executes SAST/DAST codebase scans on connected repositories.
   - Inspects image uploads for steganographic payload anomalies.
   - Reviews AI-generated git diffs and triggers 1-click Jira ticket / GitHub PR creation.
3. **Red Team Operator**:
   - Configures custom adversary attack payloads and overrides target endpoints.
   - Tests perimeter resistance using SecLists sensitive path fuzzing.
4. **Platform Administrator**:
   - Governs WAF Defense Switchboard policy toggles.
   - Configures Gemini API keys, Jira credentials, and Discord webhook channels.

---

### Figure 4.3: Sequence Diagram: Multi-Stage Attack Simulation & WAF Defense

![Figure 4.3: Sequence Diagram Strike Defense](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_3_sequence_strike.png)

#### Architectural Explanation:
Illustrates the synchronous call flow during an adversarial strike execution:
1. **Client / UI** initiates an atomic strike or Caldera campaign with payload parameters.
2. **API Gateway** validates JWT token and routes the request to the `RedTeamEngine`.
3. **RedTeamEngine** constructs the attack packet and transmits it toward the target service.
4. **WAF Interceptor Middleware** captures the inbound packet at Layer-7:
   - Evaluates active policy rules (SQLi AST parser, XSS sanitizer, Path Normalizer).
   - If the rule is enabled, it blocks the threat, logs defense telemetry, and returns `HTTP 403 Forbidden`.
   - If the rule was toggled OFF in the Switchboard, the payload penetrates to the endpoint, demonstrating defense failure.
5. **Telemetry Streamer** pushes the raw HTTP request/response headers, status codes, and latency metrics to the Live Strike Console in real time.

---

### Figure 4.4: Sequence Diagram: AI Vulnerability Triage & Automated Patch Synthesis

![Figure 4.4: Sequence Diagram AI Remediation](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_4_sequence_ai_patch.png)

#### Architectural Explanation:
Depicts the closed-loop autonomous remediation lifecycle:
1. A finding is selected in the UI, invoking `/api/v1/ai/remediate`.
2. **AI Engine (`ai_engine.py`)** extracts the vulnerable code snippet, location, and CWE classification.
3. Constructs a zero-shot prompt enriched with secure coding patterns and invokes the **Google Gemini 1.5 Flash/Pro API**.
4. **Gemini LLM** synthesizes a hardened code replacement and formats it as a valid **Unified Git Diff**.
5. The developer can:
   - Download the raw `.patch` file for manual `git apply`.
   - Click **"Create Jira Ticket"**, triggering `/api/v1/ai/jira-ticket` to post an issue directly into the team's Atlassian board.
   - Click **"Submit GitHub PR"**, which stages the diff into a dedicated remediation branch via the GitHub REST API.

---

### Figure 4.5: Activity Diagram: End-to-End DevSecOps Security Lifecycle

![Figure 4.5: Activity Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_5_activity.png)

#### Architectural Explanation:
Models the workflow state machine of code flowing through SentroniX:
- **Phase A (Intake)**: User initiates a repository scan or media file inspection.
- **Phase B (Parallel Analysis)**: Static AST scanner, dynamic fuzzer, and Shannon entropy analyzer execute concurrently.
- **Phase C (Triage Gateway)**: 
  - If no threats are discovered, the platform issues a clean bill of health with a hardened resilience grade (`A+`).
  - If vulnerabilities exceed risk thresholds, findings are automatically persisted to the database and indexed by CVSS severity.
- **Phase D (Automated Response)**: Auto-Remediation generates code fixes, synchronizes with Jira, broadcasts alerts to Discord, and awaits developer merge approval.

---

### Figure 4.6: Algorithm Flowchart: Shannon Entropy & Multi-Layer Threat Scoring

![Figure 4.6: Algorithm Flowchart](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_6_algorithm.png)

#### Architectural & Mathematical Explanation:
Defines the mathematical decision logic used by the Steganography and Threat Scoring subsystems:

1. **Shannon Entropy Calculation**:
   Given an image byte stream with byte probabilities $P(x_i)$:
   $$H(X) = - \sum_{i=0}^{255} P(x_i) \log_2 P(x_i)$$
   - If $H(X) \le 7.80$: Image is marked **CLEAN** (natural image variance).
   - If $7.80 < H(X) \le 7.94$: Marked **SUSPICIOUS** (flagged for deeper chi-square examination).
   - If $H(X) \ge 7.95$: Marked **MALICIOUS** (encrypted reverse shell payload detected, triggering automatic quarantine).

2. **Composite Posture Score Algorithm**:
   $$\text{Security Posture Score} = 100 - \left( 25 \times N_{\text{Critical}} + 10 \times N_{\text{High}} + 3 \times N_{\text{Medium}} + 1 \times N_{\text{Low}} \right) \times \left( \frac{\text{Blocked Strikes}}{\text{Total Strikes}} \right)$$
   Determines executive letter grades: **A** (90–100), **B** (75–89), **C** (60–74), **D** (40–59), and **F** (<40).

---

## 5. Data Design & Comprehensive Data Dictionary

The persistence tier is built on relational SQLite (local development) and PostgreSQL (production cloud), managed via **SQLAlchemy 2.0 ORM**.

### 5.1 Table: `users`
Stores user credentials, workspace tenant bindings, and authorization levels.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User account login email |
| `hashed_password`| VARCHAR(512) | NOT NULL | Salted PBKDF2-HMAC-SHA256 / bcrypt hash |
| `tenant_id` | VARCHAR(128) | NOT NULL, INDEXED | Multi-tenant workspace partition ID |
| `role` | VARCHAR(32) | DEFAULT 'ANALYST' | RBAC role (`ADMIN`, `ANALYST`, `AUDITOR`) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### 5.2 Table: `scans`
Maintains operational metadata for every security evaluation session.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique scan session identifier |
| `tenant_id` | VARCHAR(128) | NOT NULL, INDEXED | Workspace isolation scope |
| `scan_type` | VARCHAR(64) | NOT NULL | `SAST`, `DAST`, `PURPLE_TEAM`, `SECLISTS` |
| `target` | VARCHAR(512) | NOT NULL | Target repository URL or endpoint path |
| `status` | VARCHAR(32) | DEFAULT 'COMPLETED' | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED` |
| `critical_count` | INTEGER | DEFAULT 0 | Tally of critical findings discovered |
| `high_count` | INTEGER | DEFAULT 0 | Tally of high findings discovered |
| `started_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Scan initiation timestamp |
| `completed_at` | TIMESTAMP | NULLABLE | Scan completion timestamp |

### 5.3 Table: `findings`
Granular database record for each identified vulnerability.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique vulnerability finding ID |
| `scan_id` | INTEGER | FOREIGN KEY (`scans.id`) | Parent scan reference |
| `tenant_id` | VARCHAR(128) | NOT NULL, INDEXED | Workspace isolation scope |
| `title` | VARCHAR(255) | NOT NULL | Vulnerability summary title |
| `severity` | VARCHAR(16) | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` |
| `cwe` | VARCHAR(32) | NULLABLE | Common Weakness Enumeration ID (e.g. `CWE-89`) |
| `mitre_id` | VARCHAR(32) | NULLABLE | MITRE ATT&CK technique (e.g. `T1190`) |
| `file_location` | VARCHAR(512) | NOT NULL | Target source file and line range |
| `evidence` | TEXT | NULLABLE | Malicious injected payload / match string |
| `status` | VARCHAR(32) | DEFAULT 'OPEN' | `OPEN`, `TRIAGED`, `REMEDIATED` |

---

## 6. Software Project Management & Scheduling Models (WBS, AON, AOA, CPM)

To ensure disciplined engineering execution, rigorous resource allocation, and predictable delivery of the SentroniX platform, formal **Software Project Management (SPM)** modeling was conducted. This section details the Work Breakdown Structure (WBS), Activity-on-Node (AON) precedence network, Activity-on-Arrow (AOA) milestone network, and the mathematical Critical Path Method (CPM) calculations governing the project lifecycle.

### 6.1 Work Breakdown Structure (WBS)
The Work Breakdown Structure (WBS) decomposes the SentroniX platform into a hierarchical tree of manageable deliverables, phases, work packages, and actionable tasks. The breakdown spans six core phases: Planning & Requirements, Core Security Engine, Autonomous Purple Team Arena, Generative AI & DevSecOps Ecosystem, Frontend & Extension Presentation, and Master QA & Cloud Deployment.

![Figure 6.1: Work Breakdown Structure (WBS)](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_5_1_wbs.png)

| WBS Code | Work Package Name | Lead Subtasks & Deliverables | Engineering Focus |
| :--- | :--- | :--- | :--- |
| **1.0** | **Planning & Requirements** | 1.1 Threat Modeling, 1.2 MITRE ATT&CK Mapping, 1.3 Multi-tenant Workspace Isolation Reqs, 1.4 SDD Architecture Spec | Security Architecture & Domain Scoping |
| **2.0** | **Core Engine & Active Defense** | 2.1 FastAPI Asynchronous Endpoints, 2.2 PBKDF2/JWT Stateless IAM, 2.3 Layer-7 WAF Rule Switchboard, 2.4 Relational 3NF Schemas | Backend & Gateway Infrastructure |
| **3.0** | **Purple Team Offensive Arena** | 3.1 Atomic Strikes Engine, 3.2 MITRE Caldera 3-Stage APT Campaigns, 3.3 SecLists Path Fuzzer, 3.4 LSB Steganography Shannon Entropy | Autonomous Red/Blue Orchestration |
| **4.0** | **AI Remediation & DevSecOps** | 4.1 Google Gemini 1.5/3.6 Flash LLM Pipeline, 4.2 Unified Git Diff Engine, 4.3 Atlassian Jira Cloud Sync, 4.4 GitHub PR Branch Staging | Automated Closed-Loop Remediation |
| **5.0** | **Client Presentation & Extension** | 5.1 React 18 / Vite SPA Client, 5.2 Bento Telemetry Dashboard & Smooth Tabs, 5.3 Sliding Vulnerability Drawer, 5.4 Active Defense Chrome Extension V3 | Frontend UX & Browser Protection |
| **6.0** | **Master QA, CI/CD & Deployment** | 6.1 16-Point Automated Test Suite, 6.2 Multi-Stage Dockerfile Compilation, 6.3 Render Cloud 24/7 Deployment, 6.4 Academic SDD & User Manuals | Quality Assurance & Production Release |

---

### 6.2 Activity-on-Node (AON) Precedence Network Diagram
The Activity-on-Node (AON) precedence diagram represents tasks as rectangular nodes and task dependencies as directional arrows. It defines Finish-to-Start (FS) logical relationships across parallel development streams, illustrating how backend, frontend, security, and AI modules develop concurrently and converge at critical milestones.

![Figure 6.2: Activity-on-Node (AON) Precedence Network Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_5_2_aon.png)

**Key Topological Insights from the SentroniX AON Diagram**:
- **High Concurrency**: Following the completion of Task B (*System Architecture*), three major workstreams execute in parallel: Task C (*FastAPI Backend Core*), Task D (*Layer-7 WAF Engine*), and Task E (*React 18 Frontend Client*).
- **Convergence Gates**: Task K (*End-to-End System Integration*) serves as the primary convergence gate, requiring successful completion of Task F (*Red Team Strikes*), Task G (*Steganography Analyzer*), Task I (*Jira & GitHub PR Sync*), and Task J (*Browser Extension V3*) before full system test harnesses can execute.

---

### 6.3 Activity-on-Arrow (AOA) Milestone Network Diagram
The Activity-on-Arrow (AOA) network diagram, also known as the Arrow Diagramming Method (ADM), represents activities as directional arrows connecting numbered circular event (milestone) nodes. An event node represents a distinct point in time signifying the completion of preceding activities and the commencement of succeeding activities.

![Figure 6.3: Activity-on-Arrow (AOA) Milestone Network Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_5_3_aoa.png)

**Role of Dummy Activities in SentroniX AOA Modeling**:  
Under formal AOA modeling rules, no two event nodes may be connected by more than one activity arrow, and dependencies without direct predecessor time consumption must be modeled via zero-duration "Dummy" activities (represented by dashed arrows):
- **Dummy d1 (Node 4 $\to$ Node 6)**: Enforces that Atomic Red Team strikes (Task F) cannot proceed without the underlying WAF tokenization engine (Task D), even though Task F's primary duration stems from the backend runner (Task C).
- **Dummy d2 (Node 4 $\to$ Node 7)**: Represents the prerequisite of Layer-7 inspection headers for the image Steganography engine (Task G).
- **Dummy d5 (Node 9 $\to$ Node 10)**: Chains the completion of Jira/GitHub automated DevSecOps synchronization directly into the E2E Platform Integration milestone (Node 10).

---

### 6.4 Critical Path Method (CPM) Network & Mathematical Analysis
The Critical Path Method (CPM) is a mathematically rigorous project scheduling technique used to identify the longest sequence of dependent tasks and determine the absolute minimum project completion time. Tasks on the critical path possess zero Total Slack (Float); any delay in a critical task directly causes a day-for-day delay in the final delivery of the SentroniX platform.

![Figure 6.4: Critical Path Method (CPM) Network Diagram](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_5_4_cpm.png)

**Mathematical Formulas**:
- **Forward Pass (Early Dates)**:
  $$\text{Earliest Start (ES)} = \max(\text{EF of all Predecessors})$$
  $$\text{Earliest Finish (EF)} = \text{ES} + \text{Duration}$$
- **Backward Pass (Late Dates)**:
  $$\text{Latest Finish (LF)} = \min(\text{LS of all Successors})$$
  $$\text{Latest Start (LS)} = \text{LF} - \text{Duration}$$
- **Total Float / Slack**:
  $$\text{Total Slack} = \text{LS} - \text{ES} = \text{LF} - \text{EF}$$
- **Critical Path Condition**: A task is Critical if and only if $\text{Slack} = 0$.

#### CPM Schedule Calculation Table
| Task ID | Activity Description | Predecessors | Dur (Days) | ES | EF | LS | LF | Total Slack | Critical? |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Threat Modeling & Requirements Definition | None | 5 | 0 | 5 | 0 | 5 | 0 | **YES (Critical)** |
| **B** | System Architecture & Schema Design | A | 5 | 5 | 10 | 5 | 10 | 0 | **YES (Critical)** |
| **C** | FastAPI Asynchronous Engine & Multi-Tenant IAM | B | 8 | 10 | 18 | 10 | 18 | 0 | **YES (Critical)** |
| **D** | Layer-7 WAF Rule Switchboard & Tokenizer | B | 7 | 10 | 17 | 15 | 22 | 5 | NO (Float = 5d) |
| **E** | React 18 / Vite SPA Client & Bento Dashboard | B | 8 | 10 | 18 | 18 | 26 | 8 | NO (Float = 8d) |
| **F** | MITRE ATT&CK Atomic Strikes & Caldera Runner | C, D | 10 | 18 | 28 | 22 | 32 | 4 | NO (Float = 4d) |
| **G** | Shannon Entropy LSB Steganography Engine | C, D | 6 | 18 | 24 | 26 | 32 | 8 | NO (Float = 8d) |
| **H** | Gemini 1.5 AI Code Remediation & Git Diff | C | 9 | 18 | 27 | 18 | 27 | 0 | **YES (Critical)** |
| **I** | Atlassian Jira Cloud & GitHub PR Automation | H | 5 | 27 | 32 | 27 | 32 | 0 | **YES (Critical)** |
| **J** | Active Defense Chromium Browser Extension V3 | E | 6 | 18 | 24 | 26 | 32 | 8 | NO (Float = 8d) |
| **K** | Full Platform End-to-End System Integration | F, G, I, J | 7 | 32 | 39 | 32 | 39 | 0 | **YES (Critical)** |
| **L** | Master QA Verification Suite & Security Tests | K | 6 | 39 | 45 | 39 | 45 | 0 | **YES (Critical)** |
| **M** | Multi-Stage Docker Packaging & Render Deploy | L | 4 | 45 | 49 | 45 | 49 | 0 | **YES (Critical)** |
| **N** | Master SDD, User Manual & CISO Defense Sign-off | M | 3 | 49 | 52 | 49 | 52 | 0 | **YES (Critical)** |

> **Critical Path Analysis & Engineering Takeaway**:  
> **Critical Path**: $\mathbf{A \rightarrow B \rightarrow C \rightarrow H \rightarrow I \rightarrow K \rightarrow L \rightarrow M \rightarrow N}$  
> **Total Project Duration**: **52 Working Days (10.4 Weeks)**.  
> **Strategic Scheduling Insight**: The AI Remediation and DevSecOps workstream (Tasks C $\to$ H $\to$ I) forms the governing critical path rather than the offensive strikes (Task F) or frontend UI (Task E). Developing Google Gemini LLM prompt engineering, synthesizing valid Unified Git Diffs, and implementing Atlassian Jira Cloud OAuth/REST integrations took 14 sequential working days (Tasks H + I), whereas the Red Team engine took 10 days (Slack = 4d) and the React UI had 8 days of slack. This empirical project management finding guided our agile sprint allocation, ensuring senior engineering focus remained on the AI and Jira integration pipeline.

---

## 7. Component & RESTful API Interface Design

All API endpoints follow strict REST conventions, consume and produce `application/json`, and enforce token authentication via `Authorization: Bearer <JWT>` and workspace partition headers (`X-Tenant-ID`).

### 7.1 Authentication & Workspace API (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Creates isolated tenant credentials.
- `POST /api/v1/auth/login`: Authenticates user; issues stateless JWT access token.
- `GET /api/v1/auth/me`: Returns current user session details and active tenant workspace.

### 7.2 Purple Team & Adversary Emulation API (`/api/v1/red-team`)
- `GET /api/v1/red-team/scenarios`: Returns catalog of 8+ MITRE ATT&CK atomic strike scenarios.
- `POST /api/v1/red-team/atomic-strike`: Fires an atomic strike against an endpoint and records WAF interception telemetry.
- `GET /api/v1/red-team/campaigns`: Lists multi-phase APT profiles (e.g. APT-29 Cozy Bear).
- `POST /api/v1/red-team/campaigns/run`: Executes sequential 3-phase breach emulation.
- `POST /api/v1/red-team/fuzzing/run`: Dispatches SecLists perimeter path discovery probes.
- `POST /api/v1/red-team/live-scan`: Launches customizable HTTP payload bursts against any public target URL.
- `POST /api/v1/red-team/waf-rules/toggle`: Dynamically enables/disables specific defensive filters.

### 7.3 AI Remediation & DevSecOps API (`/api/v1/ai`)
- `POST /api/v1/ai/remediate`: Sends finding context to Gemini LLM; returns Unified Git Diff.
- `POST /api/v1/ai/jira-ticket`: Posts an issue with CVSS score and attached diff to Jira Cloud.
- `POST /api/v1/ai/github-pr`: Stages the remediation patch into a remote git branch via GitHub API.

### 7.4 Steganography & Data Inspection API (`/api/v1/steg`)
- `POST /api/v1/steg/scan`: Accepts multipart file upload; performs Shannon entropy analysis and LSB byteplane extraction; returns threat verdict and entropy chart data.

---

## 8. Security, Multi-Tenancy & Cryptographic Architecture

1. **Dual-Layer Password Storage**:
   - Primary: `passlib` with `bcrypt` (12 rounds).
   - Fallback: Standard library `hashlib.pbkdf2_hmac("sha256", password, salt, 200,000)` with 16-byte cryptographically secure random salts and constant-time comparison (`secrets.compare_digest`), ensuring absolute platform portability.
2. **Stateless JWT Authorization**:
   - Access tokens signed with HMAC-SHA256 containing `sub` (user email), `tenant_id`, and expiration timestamp (`exp = 24h`).
3. **Tenant-Level Data Isolation**:
   - Every database query in the application automatically injects `WHERE tenant_id = :active_tenant`, guaranteeing that customers cannot access or view telemetry belonging to another organization.
4. **Input Sanitization & Parameterization**:
   - SQLAlchemy ORM parameterization neutralizes SQL injection.
   - Pydantic models validate and sanitize all API request bodies before reaching controller logic.

---

## 9. DevOps, Cloud Deployment & CI/CD Pipeline

![Figure 9.1: Continuous CI/CD Deployment Pipeline](file:///c:/Users/Keval%20Doshi/Desktop/SentroniX/diagrams_sentronix_custom/fig_4_7_cicd_deployment.png)

```
[Developer Git Push] ──> [GitHub Repository (main)]
                              │
                              ▼
           [Render Cloud Automated Build Trigger]
                              │
      ┌───────────────────────┴───────────────────────┐
      ▼                                               ▼
[Stage 1: Frontend Build]                   [Stage 2: Backend Runtime]
• Node.js 20 Alpine                        • Python 3.11 Slim
• Vite 8 Build Optimization                 • Install Security Dependencies
• Output: Minified SPA static assets        • Uvicorn ASGI Server Startup
      │                                               │
      └───────────────────────┬───────────────────────┘
                              ▼
            [Unified Production Container Deployment]
            • Host: https://sentronix.onrender.com
            • Health Checks & Continuous Monitoring
            • Live Webhook Dispatch to Discord Bot
```

---

## 10. Zoom Video Presentation Script & Talking Points for Professor Review

> **Tips for Presenter (Keval Doshi)**:  
> When recording your Zoom video, share this document on your screen or open the accompanying diagrams. Use the script below as your guide:

### Opening & High-Level Architecture (Time: ~1 Minute)
> *"Respected Professor, welcome to the System Design walkthrough of **SentroniX** — our AI-Driven Purple Team Cybersecurity and Threat Management Platform.*  
> *As shown in Section 2 of our Design Document, SentroniX is engineered as a cloud-native, 4-tier architecture. It bridges offensive adversary emulation (Red Team), real-time WAF packet interception (Blue Team), and automated Gemini AI code remediation into a single continuous pipeline.*  
> *Everything is deployed live on Render Cloud using a multi-stage Docker container with a React/Vite frontend and a high-performance asynchronous FastAPI backend."*

### Explaining the Formal UML Diagrams & Algorithms (Time: ~2 Minutes)
> *"Let me guide you through the formal UML models and design artifacts in Section 4:*  
> 1. ***Figure 4.1 (ERD & Database Schema)***: *We designed our database in 3rd Normal Form with strict tenant isolation. Notice how every scan, finding, remediation, and audit log is partitioned by `tenant_id`, ensuring enterprise-grade multi-tenancy.*  
> 2. ***Figure 4.2 (Use Case Diagram)***: *Here you see our actor interactions. SecOps Analysts trigger MITRE Caldera campaigns and compliance audits; DevSecOps Engineers use our 1-click AI patch engine and Jira sync; Administrators govern real-time WAF policies.*  
> 3. ***Figure 4.3 & 4.4 (Sequence Diagrams)***: *Figure 4.3 illustrates our Layer-7 packet inspection during a strike, while Figure 4.4 demonstrates how our AI engine takes a detected vulnerability, prompts Google Gemini 1.5, generates a Unified Git Diff, and immediately synchronizes with Atlassian Jira and GitHub PRs.*  
> 4. ***Figure 4.5 & 4.6 (Activity & Algorithm Models)***: *Figure 4.6 details our mathematical Shannon Entropy engine: $H(X) = -\sum P(x) \log_2 P(x)$. If an image's entropy exceeds $7.95$, it indicates high-entropy encrypted shellcode concealed within pixel bitplanes, triggering immediate quarantine.*"

### Software Project Management, Scheduling & Critical Path (Time: ~90 Seconds)
> *"Moving to Section 6, let me walk you through our Software Project Management models:*  
> - ***Figure 6.1 (WBS)***: *We systematically decomposed SentroniX into six core phases, breaking down high-level objectives into 24 discrete work packages from initial threat modeling to Render cloud deployment.*  
> - ***Figure 6.2 (AON Network)***: *Our Activity-on-Node precedence model highlights the parallel tracks we executed — concurrent development of the FastAPI core backend, Layer-7 WAF switchboard, and React frontend, all converging into Task K for E2E integration.*  
> - ***Figure 6.3 (AOA Network)***: *In our Activity-on-Arrow diagram, you can see how milestones are sequenced with numbered event nodes, using dummy activities (d1 through d5) to enforce logical dependencies between WAF tokenization and offensive strike execution.*  
> - ***Figure 6.4 (CPM & Slack Analysis)***: *We computed the Forward and Backward passes across all 14 project activities. As proven in Table 6.4, our Critical Path is A $\to$ B $\to$ C $\to$ H $\to$ I $\to$ K $\to$ L $\to$ M $\to$ N, totaling exactly 52 working days. Because Tasks H (Gemini AI Patching) and I (Jira/GitHub Sync) had zero slack, they governed the overall release schedule, while the WAF and Frontend workstreams enjoyed 5 to 8 days of float.*"

> *"To conclude, SentroniX doesn't just find vulnerabilities — it actively proves defensive resilience through breach emulation, and immediately fixes the problem through automated AI code patches. All twelve design and SPM diagrams, API contracts, mathematical models, and database schemas in this document reflect our fully implemented, live production system."*

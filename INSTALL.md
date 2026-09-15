# ⚡ SentroniX Version 3.0 PRO — Installation & Deployment Manual

```
 ███████╗███████╗███╗   ██╗████████╗██████╗  ██████╗ ███╗   ██╗██╗██╗  ██╗
 ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║██║╚██╗██╔╝
 ███████╗█████╗  ██╔██╗ ██║   ██║   ██████╔╝██║   ██║██╔██╗ ██║██║ ╚███╔╝ 
 ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗██║   ██║██║╚██╗██║██║ ██╔██╗ 
 ███████║███████╗██║ ╚████║   ██║   ██║  ██║╚██████╔╝██║ ╚████║██║██╔╝ ██╗
 ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
 [ ENTERPRISE PURPLE TEAM AI PLATFORM // DEPLOYMENT MANUAL // VER 3.0.0 PRO ]
```

This guide details all methods to deploy, configure, and operate the **SentroniX Purple Team AI Platform**, including Dockerized enterprise microservices, lightweight zero-Docker standalone execution, and the Active Defense browser extension.

---

## 📋 System Prerequisites

| Component | Minimum Requirement | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, Ubuntu 22.04 LTS, macOS 13+ | Windows 11 Pro / Ubuntu 24.04 LTS |
| **CPU / Processor** | 4 Cores (x86_64 or ARM64) | 8+ Cores |
| **RAM / Memory** | 8 GB RAM | 16 GB RAM |
| **Disk Storage** | 10 GB Free Storage | 25 GB SSD Storage |
| **Container Engine** | Docker Engine 24.0+ & Docker Compose v2 | Docker Desktop 4.25+ |
| **Runtime (Local)** | Python 3.10+ & Node.js 18+ (LTS) | Python 3.11 & Node.js 20 |
| **Supported Browsers**| Google Chrome 110+, Microsoft Edge 110+, Brave | Google Chrome / Brave (Manifest V3) |

---

## 🚀 Deployment Methods

Choose the deployment architecture that best matches your target operational environment:

```
                  +-----------------------------------+
                  |  CHOOSE DEPLOYMENT ARCHITECTURE   |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
[ OPTION 1: DOCKER COMPOSE ]                        [ OPTION 2: STANDALONE ZERO-DOCKER ]
• Enterprise Production Microservices               • Instant 1-Click Evaluation
• PostgreSQL 15 + Redis 7 + Celery                  • Embedded SQLite (sentronix.db)
• Separated Frontend (5173) & API (8000)            • Single-Port SPA Serving (8000)
• High-concurrency background scanning              • Zero external container overhead
```

---

### Option 1: Dockerized Microservices (Recommended for Production)

This architecture initializes all 5 dedicated microservices inside an isolated Docker bridge network:
1. **Frontend**: React 18 + Vite (`http://localhost:5173`)
2. **Backend API**: FastAPI RESTful Application (`http://localhost:8000`)
3. **Database**: PostgreSQL 15 Container (`localhost:5432`)
4. **Message Broker**: Redis 7 In-Memory Broker (`localhost:6379`)
5. **Worker Daemon**: Celery Distributed Task Queue Worker

#### Step 1: Clone Repository
```bash
git clone https://github.com/AaryanThummar/Sentronix.git
cd Sentronix/sentronix-platform
```

#### Step 2: Configure Environment (`.env`)
Create a `.env` file in `sentronix-platform/`:
```env
# Security & Auth
SECRET_KEY=sentronix_super_secret_production_key_3.0_pro
PROJECT_NAME="SentroniX Purple Team AI"

# Database & Cache
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sentronix_db
POSTGRES_SERVER=db
POSTGRES_PORT=5432
REDIS_URL=redis://redis:6379/0

# AI Core Remediation Engine (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Automated Pull Request Engine (GitHub)
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO=AaryanThummar/Sentronix

# SentoBot Alert Integration (Discord)
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_discord_security_alerts_channel_id
```

#### Step 3: Build and Launch Containers
```bash
# Build and run containers in detached mode
docker compose up -d --build
```

#### Step 4: Validate Active Services
```bash
docker compose ps
```
*Expected Output:*
```
NAME                           COMMAND                  SERVICE      STATUS      PORTS
sentronix-platform-backend-1   "uvicorn app.main:ap…"   backend      running     0.0.0.0:8000->8000/tcp
sentronix-platform-db-1        "docker-entrypoint.s…"   db           running     0.0.0.0:5432->5432/tcp
sentronix-platform-frontend-1  "docker-entrypoint.s…"   frontend     running     0.0.0.0:5173->5173/tcp
sentronix-platform-redis-1     "docker-entrypoint.s…"   redis        running     0.0.0.0:6379->6379/tcp
sentronix-platform-worker-1    "celery -A app.worke…"   worker       running     
```

#### Step 5: Stop Services
```bash
# Graceful stop and network teardown
docker compose down
```

---

### Option 2: Zero-Docker Portable Standalone Deployment

For environments where Docker Desktop cannot be installed or for rapid client-side demonstrations, SentroniX provides a **Zero-Docker Portable Engine**:
- Uses an embedded local SQLite database (`sentronix.db`).
- Serves both the compiled React Single-Page Application (SPA) and FastAPI REST endpoints on a single unified port (`8000`).

#### On Windows:
Double-click `run_sentronix_standalone.bat` or run via Command Prompt:
```cmd
cd Sentronix/sentronix-platform
run_sentronix_standalone.bat
```

#### On Linux / macOS:
```bash
cd Sentronix/sentronix-platform
chmod +x run_sentronix_standalone.sh
./run_sentronix_standalone.sh
```

*The launcher script will:*
1. Automatically verify Python 3.10+ installation.
2. Create and activate a local virtual environment (`.venv`).
3. Install required Python packages from `backend/requirements.txt`.
4. Initialize the embedded SQLite schema (`sentronix.db`).
5. Launch the unified server at `http://localhost:8000`.

---

### Option 3: Manual Local Development Setup

If modifying code and debugging actively without Docker:

#### 1. Backend Setup (Terminal 1)
```bash
cd sentronix-platform/backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

# Start backend development server with auto-reload:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (Terminal 2)
```bash
cd sentronix-platform/frontend
npm install
npm run dev
```

---

## 🌐 Browser Extension V3 Installation

The **SentroniX Active Defense Browser Extension** injects active phishing link inspection, webmail DOM monitoring (Gmail/Outlook), and download steganography guards.

### Step-by-Step Installation:

```
  [1] Open Chrome / Edge -> [2] Navigate to chrome://extensions -> [3] Enable "Developer Mode"
                                                                         |
  [5] Extension Icon Appears in Toolbar <- [4] Click "Load unpacked" & select "browser-extension" folder
```

1. Open **Google Chrome**, **Microsoft Edge**, or **Brave Browser**.
2. Navigate to the extensions manager:
   - Chrome / Brave: `chrome://extensions`
   - Microsoft Edge: `edge://extensions`
3. Toggle the **Developer mode** switch (top right corner) to **ON**.
4. Click the **Load unpacked** button in the top left header.
5. In the file picker dialog, navigate to and select the folder:
   ```
   Sentronix/sentronix-platform/browser-extension
   ```
6. Click **Select Folder**.
7. The **SentroniX Active Defense V3** extension card will appear with its purple shield icon. Pin the extension to your browser toolbar.

---

## 🩺 System Verification & Health Checks

Once deployed, run these quick verification checks to confirm full operational readiness:

### 1. API Health & Swagger Documentation
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Reference**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Telemetry Verification**:
  ```bash
  curl http://localhost:8000/api/v1/dashboard/stats
  ```

### 2. Frontend Dashboard
- Navigate to [http://localhost:5173](http://localhost:5173) (Docker) or [http://localhost:8000](http://localhost:8000) (Standalone).
- Confirm that the **Security Posture Grade** card is rendered.
- Check that navigation tabs (App Defense, Purple Team Arena, WAF Switchboard, Endpoint Fuzzer, Scans, Reports, Settings) are clickable and active.

### 3. Extension Threat Check
- Click the SentroniX toolbar icon to open the popup.
- Enter `http://paypa1-login.xyz` into the Quick URL Analyzer and click **Analyze Threat**.
- Confirm that the URL is flagged as **100/100 Threat (Phishing Detected)**.

---

## 🔧 Troubleshooting & FAQ

#### Q1: `Error: listen tcp 0.0.0.0:8000: bind: address already in use`
- **Cause:** Another process (like a previously running FastAPI instance or IIS) is occupying port 8000.
- **Fix (Windows):**
  ```cmd
  netstat -ano | findstr :8000
  taskkill /PID <PID_NUMBER> /F
  ```
- **Fix (Linux/macOS):**
  ```bash
  lsof -ti:8000 | xargs kill -9
  ```

#### Q2: `docker compose up` fails with permission errors
- **Fix:** On Linux, ensure your user is added to the `docker` group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

#### Q3: Extension shows `OFFLINE SCANNER (Local Fallback)`
- **Cause:** The backend API server at `http://localhost:8000` is not running.
- **Fix:** Start the backend via Docker (`docker compose up -d`) or standalone launcher (`run_sentronix_standalone.bat`). The extension will automatically reconnect.

#### Q4: Gemini AI Patch generation returns fallback AST diff
- **Cause:** `GEMINI_API_KEY` is unset or invalid in your `.env` or Settings tab.
- **Fix:** Add a valid Google Gemini API key in `.env` or paste it directly inside **Settings > Google Gemini AI Core** in the UI.

---

## 📜 License & Compliance

SentroniX is released under the **MIT License**. For security disclosures or enterprise inquiries, consult the project repository at [https://github.com/AaryanThummar/Sentronix](https://github.com/AaryanThummar/Sentronix).

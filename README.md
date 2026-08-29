# SentroniX (Purple Team AI Platform)

Version 1.0.0

SentroniX is an automated cybersecurity platform built to bridge the gap between red team operations and blue team defenses. It provides an intuitive, centralized dashboard for automated vulnerability scanning, steganography analysis, and live threat tracking.

## Architecture
This project uses a modern containerized microservice architecture:
- **Frontend**: React + Vite (Port 5173)
- **Backend**: FastAPI / Python (Port 8000)
- **Database**: PostgreSQL (Port 5432)
- **Message Broker**: Redis (Port 6379)
- **Background Workers**: Celery

## Features included in V1
1. **Malware Threat Scanner**: Analyzes raw code or scripts via regex signatures for common backdoors, reverse shells, and command injections.
2. **Steganography Analyzer**: Upload an image to analyze appended binary payloads or hidden data.
3. **Application & Code-Level Defense**:
   - SAST (Static Analysis via Semgrep)
   - DAST (Dynamic Analysis via OWASP ZAP & Nuclei)
   - SCA (Software Composition Analysis via Trivy)
4. **Live Statistics Dashboard**: Tracks total scans run and aggregate threat severity levels in real-time across the platform.

## Getting Started

Make sure you have Docker and Docker Compose installed.

### 1. Build and Run the Stack
```bash
docker-compose up -d --build
```
This will automatically build the images, initialize the network, and start all 5 services in detached mode.

### 2. Access the Application
- Open [http://localhost:5173](http://localhost:5173) in your browser for the main UI.
- The backend API runs on [http://localhost:8000](http://localhost:8000).

### 3. Shutting Down
To gracefully stop the platform and remove the containers:
```bash
docker-compose down
```

## Contributing
To add new scanner plugins, register the task in `backend/app/workers/tasks_app_defense.py` and bind it to a new route in `backend/app/api/v1/app_defense.py`.

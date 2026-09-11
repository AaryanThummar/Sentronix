@echo off
title SentroniX Cyberdefense Platform (Zero-Docker Standalone)
color 0B

echo =====================================================================
echo           SENTRONIX PURPLE TEAM CYBERDEFENSE PLATFORM
echo                    (Standalone Launcher - No Docker Required)
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please download and install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

:: 2. Check Backend Virtualenv
if not exist "sentronix-platform\backend\venv" (
    echo [*] Initializing standalone environment...
    python -m venv sentronix-platform\backend\venv
    echo [*] Installing required dependencies...
    sentronix-platform\backend\venv\Scripts\python.exe -m pip install --upgrade pip
    sentronix-platform\backend\venv\Scripts\python.exe -m pip install -r sentronix-platform\backend\requirements.txt
)

:: 3. Launching SentroniX Single-Port Unified Server
echo [*] Starting SentroniX Server on http://localhost:8000 ...
echo [*] Frontend, API, and SQLite Database are fully integrated on port 8000.
echo.

:: Automatically open browser after 2 seconds in the background
start "" timeout /t 2 /nobreak >nul & start http://localhost:8000/

:: Start Uvicorn
cd sentronix-platform\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

pause

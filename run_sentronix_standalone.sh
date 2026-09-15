#!/usr/bin/env bash
# SentroniX Standalone Launcher (Linux & macOS - Zero Docker Required)

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "====================================================================="
echo "          SENTRONIX PURPLE TEAM CYBERDEFENSE PLATFORM"
echo "                   (Standalone Launcher - No Docker Required)"
echo "====================================================================="
echo ""

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3.10+ (e.g. sudo apt install python3-venv python3-pip)"
    exit 1
fi

# 2. Check Virtualenv
if [ ! -d "sentronix-platform/backend/venv" ]; then
    echo "[*] Creating virtual environment..."
    python3 -m venv sentronix-platform/backend/venv
    echo "[*] Installing dependencies..."
    sentronix-platform/backend/venv/bin/pip install --upgrade pip
    sentronix-platform/backend/venv/bin/pip install -r sentronix-platform/backend/requirements.txt
fi

# 3. Launch Server
echo "[*] Launching SentroniX on http://localhost:8000 ..."
echo "[*] Both Frontend and Backend are served on port 8000 (SQLite embedded)."
echo ""

# Open browser if on macOS or Linux desktop
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open "http://localhost:8000/") &
elif [[ "$OSTYPE" == "linux-gnu"* ]] && command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open "http://localhost:8000/") &
fi

cd sentronix-platform/backend
./venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

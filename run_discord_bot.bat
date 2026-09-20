@echo off
title SentroniX SentoBot Operations
cd /d "%~dp0"
echo ==============================================================
echo        SentroniX Purple-Team Discord SecOps Bot Launcher
echo ==============================================================
echo [*] Checking environment and launching SentoBot...

if exist "backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=backend\venv\Scripts\python.exe"
    set "BOT_SCRIPT=backend\app\workers\discord_bot.py"
) else if exist "sentronix-platform\backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=sentronix-platform\backend\venv\Scripts\python.exe"
    set "BOT_SCRIPT=sentronix-platform\backend\app\workers\discord_bot.py"
) else (
    set "PYTHON_EXE=python"
    set "BOT_SCRIPT=backend\app\workers\discord_bot.py"
)

"%PYTHON_EXE%" "%BOT_SCRIPT%"
if %errorlevel% neq 0 (
    echo.
    echo [!] SentoBot process exited with error code %errorlevel%.
    pause
)

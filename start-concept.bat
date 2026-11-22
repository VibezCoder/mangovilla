@echo off
cd /d "%~dp0"
start "Mango Villa concept server" cmd /c "node server.mjs"
timeout /t 2 >nul
start "" http://127.0.0.1:8901/

@echo off
rem Starts the complete project with one double-click:
rem   1. the database API (JSON Server) on port 3001
rem   2. the website (Vite) on port 5173
rem   3. the browser
rem Close the two black windows to stop everything.

cd /d "%~dp0"

if not exist node_modules (
  echo Installing packages, this happens only the first time...
  call npm install
)

start "API - JSON Server (port 3001)" cmd /k npx json-server db.json --port 3001
start "Website - Vite (port 5173)" cmd /k npm run dev

rem give both servers a few seconds to start, then open the website
timeout /t 6 /nobreak >nul
start http://localhost:5173

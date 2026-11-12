@echo off
REM ==========================================================================
REM  UdyamSetuAI - double-click to set up (first time) and open the dashboard.
REM  First time: installs Python / Node.js if missing (via winget), the
REM  project's packages, builds the website and asks for your Groq key.
REM  After that it just starts the server and opens the browser.
REM ==========================================================================
setlocal EnableExtensions
cd /d "%~dp0"
title UdyamSetuAI
echo.
echo  ===== UdyamSetuAI: getting everything ready =====
echo.

REM ---- 1. Python (3.10 or newer) -------------------------------------------
set "PY="
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>nul && set "PY=py -3"
if not defined PY python -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>nul && set "PY=python"
if not defined PY (
  echo  Python was not found. Installing Python 3.12 now ^(this needs internet^)...
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  echo.
  echo  Python is installed. Please CLOSE this window and double-click start.bat again.
  pause
  exit /b 0
)
echo  [1/5] Python found.

REM ---- 2. Python packages --------------------------------------------------
if not exist "backend\.venv\Scripts\python.exe" (
  echo  [2/5] Creating the Python environment ^(first time only^)...
  %PY% -m venv backend\.venv || goto :failed
)
echo  [2/5] Installing / checking Python packages...
"backend\.venv\Scripts\python.exe" -m pip install -q --disable-pip-version-check -r backend\requirements.txt || goto :failed

REM ---- 3. Website (built once; delete frontend\dist to rebuild) -------------
if exist "frontend\dist\index.html" goto :website_ready
call npm --version >nul 2>nul
if errorlevel 1 (
  echo  Node.js was not found. Installing Node.js LTS now ^(this needs internet^)...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  echo.
  echo  Node.js is installed. Please CLOSE this window and double-click start.bat again.
  pause
  exit /b 0
)
echo  [3/5] Building the website ^(first time only, about a minute^)...
pushd frontend
call npm install || (popd & goto :failed)
call npm run build || (popd & goto :failed)
popd
:website_ready
echo  [3/5] Website ready.

REM ---- 4. Keys in .env -----------------------------------------------------
if not exist ".env" copy ".env.example" ".env" >nul
findstr /r /c:"^GROQ_API_KEY=..*" ".env" >nul 2>nul
if errorlevel 1 (
  echo.
  echo  The chat assistant needs a free Groq key: console.groq.com - API Keys - Create API Key.
  set "GROQKEY="
  set /p "GROQKEY= Paste your Groq key and press Enter (or just press Enter to skip): "
  call :save_key
)
echo  [4/5] Keys checked ^(.env^).

REM ---- 5. Start the server and open the dashboard --------------------------
echo  [5/5] Starting UdyamSetuAI. The dashboard opens in your browser in a few seconds.
echo        Keep this window open while you use it. Close it to stop UdyamSetuAI.
echo        Address: http://127.0.0.1:8000/dashboard   Demo sign-in: 9876543210 / PIN 2026
echo.
start "" cmd /c "timeout /t 5 >nul & start http://127.0.0.1:8000/dashboard"
"backend\.venv\Scripts\python.exe" -m uvicorn backend.app:app --port 8000
echo.
echo  UdyamSetuAI stopped.
pause
exit /b 0

:save_key
if "%GROQKEY%"=="" (
  echo  No key entered: the chat will say "AI offline". Add it later in the .env file.
  exit /b 0
)
powershell -NoProfile -Command "$k=$env:GROQKEY; (Get-Content '.env') -replace '^GROQ_API_KEY=.*', ('GROQ_API_KEY=' + $k) | Set-Content '.env'"
echo  Key saved in .env ^(this file is never uploaded to GitHub^).
exit /b 0

:failed
echo.
echo  Something went wrong above. Take a screenshot of this window and send it to the team.
pause
exit /b 1

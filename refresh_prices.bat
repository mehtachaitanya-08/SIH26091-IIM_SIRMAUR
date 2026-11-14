@echo off
REM ==========================================================================
REM  UdyamSetuAI - double-click to refresh the SAVED mandi prices.
REM
REM  Why (14 Nov 2026): data.gov.in refuses connections from Render, so the live
REM  site cannot fetch prices itself. Run this on a connection where data.gov.in
REM  works (this laptop). It asks data.gov.in for each crop and saves the latest
REM  price to data\mandi_snapshot.json. Then commit and push that file to GitHub
REM  and redeploy on Render: the site shows the saved price, labelled saved, with
REM  its market and date, whenever it cannot fetch a live one.
REM
REM  The data.gov.in key is NOT in this file. It is read from the saved Windows
REM  setting DATA_GOV_IN_API_KEY (or the .env file) and never printed.
REM ==========================================================================
setlocal EnableExtensions
cd /d "%~dp0"
title UdyamSetuAI - refresh saved mandi prices
echo.
echo  ===== Refreshing the saved mandi prices =====
echo.

if not exist "backend\.venv\Scripts\python.exe" (
  echo  The Python environment is missing. Double-click start.bat once, then try again.
  echo.
  pause
  exit /b 1
)

REM Read the key fresh from the Windows user setting, so a key saved a moment ago is found
REM even if this window started before it was saved.
if not defined DATA_GOV_IN_API_KEY (
  for /f "usebackq delims=" %%K in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('DATA_GOV_IN_API_KEY','User')"`) do set "DATA_GOV_IN_API_KEY=%%K"
)

"backend\.venv\Scripts\python.exe" scripts\refresh_mandi_snapshot.py
set "RESULT=%ERRORLEVEL%"
echo.
if "%RESULT%"=="0" (
  echo  Now send the changed file data\mandi_snapshot.json to GitHub ^(commit and push^),
  echo  then redeploy the service on Render.
) else (
  echo  Nothing was changed. Read the lines above to see why.
)
echo.
pause
exit /b %RESULT%

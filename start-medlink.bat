@echo off
title MedLink Launcher
cd /d "%~dp0backend"

echo Starting the MedLink backend...
start "MedLink Backend" cmd /k "npm run dev"

echo Waiting for the server to start...
timeout /t 5 /nobreak >nul

echo Opening MedLink in your browser...
start "" "%~dp0index.html"

echo.
echo MedLink is starting up.
echo A second window titled "MedLink Backend" is now running your server - keep that window open while you use the site.
echo You can close this window.
pause

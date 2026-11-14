@echo off
taskkill /F /IM node.exe
taskkill /F /IM tsc.exe
taskkill /F /IM powershell.exe
timeout /t 5 /nobreak >nul
echo All processes killed
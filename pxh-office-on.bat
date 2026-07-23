@echo off
set PORT=2910
set SERVER=%~dp0skills\virtual-office\templates\server.mjs

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING" 2^>nul') do (
  echo [!] Virtual Office da chay tren port %PORT% ^(PID: %%a^)
  start http://localhost:%PORT%
  exit /b
)

echo [*] Dang start Virtual Office tren port %PORT%...
start "VirtualOffice" /min cmd /c "set PORT=%PORT% && node "%SERVER%""
timeout /t 2 /nobreak >nul
start http://localhost:%PORT%
echo [+] Da start: http://localhost:%PORT%

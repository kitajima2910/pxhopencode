@echo off
set PORT=2910

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING" 2^>nul') do (
  echo [*] Dang kill PID %%a tren port %PORT%...
  taskkill /F /PID %%a >nul 2>&1
  echo [+] Da tat Virtual Office.
  exit /b
)

echo [-] Khong co Virtual Office nao chay tren port %PORT%.

@echo off
set PORT=2910
set SERVER=%~dp0skills\virtual-office\templates\server.mjs
set ACTION=%1
if "%ACTION%"=="" (
  echo Cach dung: pxh-office [on^|off^|restart]
  echo   on      - Start Virtual Office server
  echo   off     - Tat Virtual Office server
  echo   restart - Tat + start lai + mo browser
  exit /b 1
)

:: --- KILL existing server ---
set KILLED=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING" 2^>nul') do (
  echo [x] Dang tat Virtual Office ^(PID: %%a^)...
  taskkill /F /PID %%a >nul 2>&1
  set KILLED=1
  timeout /t 1 /nobreak >nul
)

if "%ACTION%"=="off" (
  if %KILLED%==1 (
    echo [+] Da tat Virtual Office.
  ) else (
    echo [-] Khong co Virtual Office nao chay tren port %PORT%.
  )
  exit /b
)

:: --- START ---
echo [*] Dang start Virtual Office tren port %PORT%...
start "VirtualOffice" /min cmd /c "set PORT=%PORT% && node "%SERVER%""
timeout /t 2 /nobreak >nul
echo [+] Da start: http://localhost:%PORT%

if "%ACTION%"=="restart" start http://localhost:%PORT%
if "%ACTION%"=="on" start http://localhost:%PORT%

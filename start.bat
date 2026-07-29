@echo off
REM pxhopencode Start — init memory + launch opencode
REM Usage: from project root: start.bat

setlocal enabledelayedexpansion

REM Detect mode and set paths
if exist "_shared\scripts\start.ps1" (
  REM Standalone mode: running from project root
  set PROJ=.
  set SCR=.
) else if exist ".opencode\_shared\scripts\start.ps1" (
  REM Embedded mode: running from project root (parent of .opencode/)
  set PROJ=.
  set SCR=.opencode
) else if exist "..\_shared\scripts\start.ps1" (
  REM Embedded mode: running from .opencode/ itself
  set PROJ=..
  set SCR=.
) else (
  echo [FAIL] Run from project root (where _shared/ or .opencode/ lives)
  pause
  exit /b 1
)

cd /d "!PROJ!"
echo ==^> Initializing pxhopencode...
set PS_SCRIPT=%SCR%\_shared\scripts\start.ps1
powershell -ExecutionPolicy Bypass -File "!PS_SCRIPT!"
if !errorlevel! neq 0 (
  pause
  exit /b !errorlevel!
)

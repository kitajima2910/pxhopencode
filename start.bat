@echo off
REM pxhopencode Start — deterministic session init
REM Run from cmd or double-click. Works standalone or inside .opencode/

setlocal enabledelayedexpansion

REM Detect mode: are we inside .opencode/?
if exist ".opencode\_shared\scripts\start.ps1" (
  set SCRIPT=.opencode\_shared\scripts\start.ps1
) else if exist "_shared\scripts\start.ps1" (
  set SCRIPT=_shared\scripts\start.ps1
) else (
  echo [FAIL] Cannot find start.ps1. Run from project root or .opencode/ parent.
  pause
  exit /b 1
)

echo ==^> Running init-memory.ps1...
powershell -ExecutionPolicy Bypass -File "!SCRIPT!"
if %errorlevel% neq 0 (
  echo [FAIL] init failed (exit %errorlevel%)
  pause
  exit /b 1
)

echo ==^> All checks passed. Ready to run: opencode
pause

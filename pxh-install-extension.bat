@echo off
setlocal enabledelayedexpansion
set "EXT_NAME=pxh-virtual-office"
set "EXT_VER=1.0.0"
set "SRC=%~dp0skills\virtual-office\extension"
set "ACTION=%1"

if "%ACTION%"=="" set ACTION=install

:: Detect VS Code type
set "CODE_TYPE=stable"
if "%2"=="insiders" set "CODE_TYPE=insiders"
if "%2"=="stable" set "CODE_TYPE=stable"

if "%CODE_TYPE%"=="insiders" (
  set "EXT_DIR=%USERPROFILE%\.vscode-insiders\extensions\%EXT_NAME%-%EXT_VER%"
  set "VSCMD=code-insiders"
) else (
  set "EXT_DIR=%USERPROFILE%\.vscode\extensions\%EXT_NAME%-%EXT_VER%"
  set "VSCMD=code"
)

if /i "%ACTION%"=="install" goto :install
if /i "%ACTION%"=="uninstall" goto :uninstall
if /i "%ACTION%"=="reload" goto :reload
goto :help

:install
echo ============================================
echo  PXH Virtual Office - Cai dat Extension
echo ============================================
echo.
echo  Target: %CODE_TYPE% VS Code
echo  Source: %SRC%
echo  Dest:   %EXT_DIR%
echo.

if not exist "%SRC%\package.json" (
  echo [LOI] Khong tim thay extension tai: %SRC%
  echo        Dam bao ban dang chay tu thu muc goc .opencode
  exit /b 1
)

:: Remove old version if exists
if exist "%EXT_DIR%" (
  echo [*] Dang xoa version cu...
  rmdir /s /q "%EXT_DIR%" 2>nul
)

:: Create extensions dir if needed
if not exist "%EXT_DIR%\.." mkdir "%EXT_DIR%\.." 2>nul

echo [*] Dang copy extension...
xcopy "%SRC%" "%EXT_DIR%" /E /I /H /Y /Q >nul
if %ERRORLEVEL% neq 0 (
  echo [LOI] Khong the copy extension.
  exit /b 1
)

echo [+] Da cai dat thanh cong!
echo.
echo [^^^>] Hay khoi dong lai VS Code hoac nhan Ctrl+Shift+P - "Developer: Reload Window"
echo.

:: Try to auto-reload VS Code
where %VSCMD% >nul 2>&1
if %ERRORLEVEL% equ 0 (
  echo [*] Dang reload VS Code...
  %VSCMD% --install-extension "%EXT_DIR%" --force >nul 2>&1
)
exit /b

:uninstall
echo ============================================
echo  PXH Virtual Office - Go cai dat
echo ============================================
echo.

if exist "%EXT_DIR%" (
  echo [*] Dang xoa extension...
  rmdir /s /q "%EXT_DIR%" 2>nul
  echo [+] Da go cai dat.
) else (
  echo [-] Extension chua duoc cai dat.
)
exit /b

:reload
echo [*] Dang reload VS Code...
where %VSCMD% >nul 2>&1
if %ERRORLEVEL% equ 0 (
  %VSCMD% --command "workbench.action.reloadWindow" >nul 2>&1
  echo [+] Da gui lenh reload.
) else (
  echo [-] Khong tim thay %VSCMD%. Hay reload thu cong: Ctrl+Shift+P ^> "Developer: Reload Window"
)
exit /b

:help
echo Cach dung: pxh-install-extension [install^|uninstall^|reload] [stable^|insiders]
echo.
echo   install    - Cai dat extension vao VS Code (mac dinh)
echo   uninstall  - Go cai dat
echo   reload     - Reload VS Code window
echo.
echo   stable     - VS Code Stable (mac dinh)
echo   insiders   - VS Code Insiders
echo.
echo Vi du:
echo   pxh-install-extension                  # Install vao VS Code Stable
echo   pxh-install-extension install insiders  # Install vao VS Code Insiders
echo   pxh-install-extension uninstall         # Go cai dat
exit /b

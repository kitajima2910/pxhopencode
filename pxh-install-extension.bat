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
echo.

if not exist "%SRC%\package.json" (
  echo [LOI] Khong tim thay extension tai: %SRC%
  echo        Dam bao ban dang chay tu thu muc goc .opencode
  exit /b 1
)

:: Check if node is available for packaging
where node >nul 2>&1
if %ERRORLEVEL% neq 0 goto :install_copy

:: Check if code CLI is available
where %VSCMD% >nul 2>&1
if %ERRORLEVEL% neq 0 goto :install_copy

echo [*] Dang dong goi extension thanh .vsix...
set "TEMP_BUILD=%TEMP%\pxh-ext-build"
if exist "%TEMP_BUILD%" rmdir /s /q "%TEMP_BUILD%" 2>nul
xcopy "%SRC%" "%TEMP_BUILD%" /E /I /H /Y /Q >nul

:: Create temp package.json override to avoid vsce prompts
set "VSIX_FILE=%TEMP%\pxh-virtual-office.vsix"
if exist "%VSIX_FILE%" del /f /q "%VSIX_FILE%" 2>nul

pushd "%TEMP_BUILD%"
npx --yes @vscode/vsce package --out "%VSIX_FILE%" --allow-missing-repository >nul 2>&1
set VSCE_ERR=%ERRORLEVEL%
popd

if %VSCE_ERR% neq 0 (
  echo [!] Khong the dong goi .vsix, thu cai dat bang cach copy truc tiep...
  rmdir /s /q "%TEMP_BUILD%" 2>nul
  goto :install_copy
)

echo [*] Dang cai dat extension...
%VSCMD% --install-extension "%VSIX_FILE%" --force 2>&1
set INSTALL_ERR=%ERRORLEVEL%

:: Cleanup
rmdir /s /q "%TEMP_BUILD%" 2>nul
del /f /q "%VSIX_FILE%" 2>nul

if %INSTALL_ERR% neq 0 (
  echo [!] code --install-extension bi loi, thu cai dat bang cach copy truc tiep...
  goto :install_copy
)

echo [+] Da cai dat thanh cong!
echo.
echo [^^>] Mo VS Code, sidebar se co icon ^$(organization^) "PXH Virtual Office"
echo.
exit /b

:install_copy
:: Fallback: copy directly to extensions folder
echo [*] Dang copy extension truc tiep...
set "DEST=%EXT_DIR%"
if exist "%DEST%" rmdir /s /q "%DEST%" 2>nul
if not exist "%DEST%\.." mkdir "%DEST%\.." 2>nul
xcopy "%SRC%" "%DEST%" /E /I /H /Y /Q >nul
if %ERRORLEVEL% neq 0 (
  echo [LOI] Khong the copy extension.
  exit /b 1
)

echo [+] Da copy extension vao: %DEST%
echo.
echo [^^>] DONG HOAN TOAN VS Code (tat tat ca cua so), sau do mo lai.
echo     Neu da dong VS Code truoc khi chay script nay, chi can mo lai VS Code.
echo.
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

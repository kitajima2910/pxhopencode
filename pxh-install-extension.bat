@echo off
setlocal enabledelayedexpansion
set "PUBLISHER=pxh"
set "EXT_NAME=pxh-virtual-office"
set "SRC=%~dp0skills\virtual-office\extension"
set "ACTION=%1"

:: Detect VS Code type
set "CODE_TYPE=stable"
if "%1"=="insiders" set "CODE_TYPE=insiders"
if "%1"=="stable" set "CODE_TYPE=stable"

if "%CODE_TYPE%"=="insiders" (
  set "EXT_BASE=%USERPROFILE%\.vscode-insiders\extensions"
  set "VSCMD=code-insiders"
) else (
  set "EXT_BASE=%USERPROFILE%\.vscode\extensions"
  set "VSCMD=code"
)
if /i "%ACTION%"=="uninstall" goto :uninstall
if /i "%ACTION%"=="reload" goto :reload

:install
echo ============================================
echo  PXH Virtual Office - Cai dat Extension
echo ============================================
echo.
echo  Target: %CODE_TYPE% VS Code
echo  Source: %SRC%
echo.

:: Xoa sach moi thu cua extension nay (moi phien ban, moi cach dat ten) roi cai moi
echo [*] Dang xoa moi version cu cua extension...
for /d %%d in ("%EXT_BASE%\%PUBLISHER%.%EXT_NAME%*") do (
  echo     - Xoa: %%d
  rmdir /s /q "%%d" 2>nul
)
echo [+] Da xoa sach extension cu.
echo.

if not exist "%SRC%\package.json" (
  echo [LOI] Khong tim thay extension tai: %SRC%
  echo        Dam bao ban dang chay tu thu muc goc .opencode
  exit /b 1
)

:: Doc version tu package.json
set "EXT_VER="
for /f "tokens=2 delims=:" %%v in ('findstr /i "version" "%SRC%\package.json"') do (
  set "EXT_VER=%%v"
)
if defined EXT_VER (
  set "EXT_VER=!EXT_VER:"=!
  set "EXT_VER=!EXT_VER: =!
  set "EXT_VER=!EXT_VER:,=!
)
if not defined EXT_VER set "EXT_VER=1.0.0"
echo [*] Extension version: !EXT_VER!
set "EXT_DIR=%EXT_BASE%\%PUBLISHER%.%EXT_NAME%-!EXT_VER!"

:: Copy directly — skip vsce packaging (unreliable + slow)
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
echo.
echo [^^>] Mo VS Code, mo sidebar PXH Virtual Office, click vao terminal PXH de go lenh.
exit /b

:uninstall
echo ============================================
echo  PXH Virtual Office - Go cai dat
echo ============================================
echo.

set "DELETED="
for /d %%d in ("%EXT_BASE%\%PUBLISHER%.%EXT_NAME%*") do (
  echo     - Xoa: %%d
  rmdir /s /q "%%d" 2>nul
  set "DELETED=1"
)
if defined DELETED (
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



@echo off

rmdir /q/s bin >nul 2>&1
mkdir bin >nul 2>&1
mkdir bin\win >nul 2>&1
mkdir bin\win\locales
del nuget.exe >nul 2>&1
echo Fetching Installer
bitsadmin /transfer nuget /priority NORMAL https://api.nuget.org/downloads/nuget.exe %CD%\nuget.exe  >nul 2>&1

echo Installing ChromiumEmbedded
:: nuget install CefSharp.Core -NonInteractive
nuget install CefSharp.Wpf -NonInteractive

for /F %%i in (' "dir *.pak /b/s | findstr /rvc:"locales" | findstr /rc:"cef.redist.x64" | findstr /rvc:"x86"" ') do copy /y %%i %CD%\bin\win\  >nul 2>&1
for /F %%i in (' "dir locales /b/s | findstr /rc:"cef.redist.x64" | findstr /rvc:"x86"" ') do copy /y %%i %CD%\bin\win\locales  >nul 2>&1
for /F %%i in (' "dir *.dll /b/s | findstr /rc:"cef.redist.x64" | findstr /rvc:"x86"" ') do copy /y %%i %CD%\bin\win\  >nul 2>&1
for /F %%i in (' "dir *.dll /b/s | findstr /rc:"CefSharp." | findstr /rvc:"x86" | findstr /rvc:"bin\\win"" ') do copy /y %%i %CD%\bin\win\  >nul 2>&1
for /F %%i in (' "dir *.exe /b/s | findstr /rc:"CefSharp." | findstr /rvc:"x86" | findstr /rvc:"bin\\win"" ') do copy /y %%i %CD%\bin\win\  >nul 2>&1
for /F %%i in (' "dir icudtl.dat /b/s | findstr /rc:"cef.redist.x64" | findstr /rvc:"bin\\win"" ') do copy /y %%i %CD%\bin\win >nul 2>&1
for /D %%i in (cef.redist.*) do rmdir /q/s %%i >nul 2>&1
for /D %%i in (CefSharp.*) do rmdir /q/s %%i >nul 2>&1

del nuget.exe >nul 2>&1

copy /Y CefSharp.InterfacesToEvents.dll bin\win\
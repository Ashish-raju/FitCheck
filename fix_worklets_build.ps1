$ErrorActionPreference = "Stop"
# Use the known working long path
Set-Location "c:\Users\VudumudiAshishRamaRa\Downloads\Agents Engne 1.0 4\Agents Engne 1.0\FirewallHost\android"
Write-Host "Cleaning build and native caches..."
rm -Recurse -Force .cxx -ErrorAction SilentlyContinue
rm -Recurse -Force "C:\tmp\AgentsEngine\app_build" -ErrorAction SilentlyContinue
./gradlew.bat clean --no-daemon
Write-Host "Building Debug APK (No Daemon)..."
cmd /c "gradlew.bat assembleDebug --no-daemon > build_log.txt 2>&1"
Write-Host "Build Complete (Check build_log.txt)"

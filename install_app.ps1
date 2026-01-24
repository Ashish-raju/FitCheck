$apkPath = "C:\AgentsEngine\FirewallHost\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "Error: APK not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "Found APK at: $apkPath" -ForegroundColor Green
Write-Host "Attempting install via ADB..."

# Try to find adb in standard locations if not in PATH
$adb = "adb"
if (-not (Get-Command "adb" -ErrorAction SilentlyContinue)) {
    $env:LOCALAPPDATA + "\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path ($env:LOCALAPPDATA + "\Android\Sdk\platform-tools\adb.exe")) {
        $adb = $env:LOCALAPPDATA + "\Android\Sdk\platform-tools\adb.exe"
        Write-Host "Using found ADB: $adb"
    } else {
        Write-Host "Warning: ADB not found in PATH or standard location." -ForegroundColor Yellow
    }
}

& $adb install -r $apkPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! App installed." -ForegroundColor Green
    Write-Host "1. Open 'FirewallHost' on your device."
    Write-Host "2. Shake device -> Settings -> Metro host."
    Write-Host "3. Ensure your Metro bundler is running (npx expo start)."
} else {
    Write-Host "Install failed. Make sure your device is connected and USB debugging is ON." -ForegroundColor Red
}

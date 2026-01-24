$ErrorActionPreference = "Stop"
$Target = "C:\Users\VudumudiAshishRamaRa\Downloads\Agents Engne 1.0 4\Agents Engne 1.0\FirewallHost"

# Mount W: only if not already mounted correctly
if (Test-Path W:\) {
    Write-Host "W: already exists. Assuming it is correct."
} else {
    Write-Host "Mounting W: to $Target"
    subst W: "$Target"
}

if (!(Test-Path W:\android)) {
    Write-Error "W:\android not found. Mount failed or wrong path."
    exit 1
}

Set-Location "W:\android"
Write-Host "Starting Build on W: drive..."
cmd /c "gradlew.bat assembleDebug --no-daemon > build_log_w.txt 2>&1"
Write-Host "Build on W: Complete."

$ErrorActionPreference = "Stop"

$WorkletsNodePath = "C:\Users\VudumudiAshishRamaRa\Downloads\Agents Engne 1.0 4\Agents Engne 1.0\FirewallHost\node_modules\react-native-worklets\android\build"
$WorkletsTmpPath = "C:\tmp\AgentsEngine\react-native-worklets\build"

Write-Host "Removing stale worklets build directory in node_modules..."
if (Test-Path $WorkletsNodePath) {
    Remove-Item -Recurse -Force $WorkletsNodePath
}

Write-Host "Ensuring target directory exists..."
if (-not (Test-Path $WorkletsTmpPath)) {
    New-Item -ItemType Directory -Force -Path $WorkletsTmpPath | Out-Null
}

Write-Host "Creating Junction..."
cmd /c "mklink /J ""$WorkletsNodePath"" ""$WorkletsTmpPath"""

Write-Host "Link created successfully."

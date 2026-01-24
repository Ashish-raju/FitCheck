$ErrorActionPreference = "Stop"

function Create-Link {
    param (
        [string]$NodePath,
        [string]$TmpPath
    )

    Write-Host "Processing link for: $NodePath"
    
    # Ensure parent of NodePath exists (e.g. android folder)
    $Parent = Split-Path $NodePath
    if (-not (Test-Path $Parent)) {
        Write-Host "Warning: Parent directory $Parent does not exist. Skipping."
        return
    }

    # Remove existing 'build' folder in node_modules (stale or just a folder)
    if (Test-Path $NodePath) {
        Remove-Item -Recurse -Force $NodePath -ErrorAction SilentlyContinue
    }

    # Ensure target exists in C:\tmp (it should if build ran)
    if (-not (Test-Path $TmpPath)) {
        Write-Host "Creating target directory $TmpPath to satisfy link..."
        New-Item -ItemType Directory -Force -Path $TmpPath | Out-Null
    }

    # Create Junction
    cmd /c "mklink /J ""$NodePath"" ""$TmpPath"""
}

$BaseNode = "C:\Users\VudumudiAshishRamaRa\Downloads\Agents Engne 1.0 4\Agents Engne 1.0\FirewallHost\node_modules"
$BaseTmp = "C:\tmp\AgentsEngine"

# Map: NodeModulePathRelative -> TmpProjectName
$Links = @{
    "react-native-gesture-handler\android\build" = "react-native-gesture-handler\build";
    "react-native-reanimated\android\build" = "react-native-reanimated\build";
    "react-native-worklets\android\build" = "react-native-worklets\build";
    "expo-modules-core\android\build" = "expo-modules-core\build";
    "@react-native-async-storage\async-storage\android\build" = "react-native-async-storage_async-storage\build";
}

foreach ($Key in $Links.Keys) {
    Create-Link -NodePath "$BaseNode\$Key" -TmpPath "$BaseTmp\$($Links[$Key])"
}

Write-Host "All links created."

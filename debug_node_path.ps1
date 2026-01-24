subst X: "c:\Users\VudumudiAshishRamaRa\Downloads\Agents Engne 1.0 4\Agents Engne 1.0"
Set-Location X:\FirewallHost\android
Write-Host "Standard Resolution:"
node --print "require.resolve('react-native/package.json')"
Write-Host "Preserve Symlinks:"
node --preserve-symlinks --print "require.resolve('react-native/package.json')"
cmd /c "subst X: /D"

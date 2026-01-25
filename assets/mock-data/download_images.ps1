# PowerShell script to download product images
$outputDir = "$PSScriptRoot\images"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

function Download-Image {
    param([string]$url, [string]$filename)
    $outputPath = Join-Path $outputDir $filename
    try {
        Write-Host "Downloading $filename..."
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] $filename" -ForegroundColor Green
        Start-Sleep -Milliseconds 300
        return $true
    }
    catch {
        Write-Host "[FAIL] $filename" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n=== Downloading Product Images ===" -ForegroundColor Cyan

$urls = @(
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5445.png"; name="tshirt_white_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5440.png"; name="tshirt_black_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5441.png"; name="tshirt_grey_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5442.png"; name="tshirt_red_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5443.png"; name="tshirt_blue_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5444.png"; name="tshirt_green_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5446.png"; name="tshirt_yellow_basic.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5447.png"; name="tshirt_navy_basic.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG100.png"; name="hoodie_black.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG91.png"; name="hoodie_grey.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG92.png"; name="hoodie_white.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG93.png"; name="hoodie_navy.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png"; name="shirt_white_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8110.png"; name="shirt_blue_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8115.png"; name="shirt_pink_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8118.png"; name="shirt_grey_dress.png"},
    @{url="https://pngimg.com/uploads/leather_jacket/leather_jacket_PNG25.png"; name="jacket_leather_black.png"},
    @{url="https://pngimg.com/uploads/leather_jacket/leather_jacket_PNG26.png"; name="jacket_leather_brown.png"},
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8050.png"; name="jacket_bomber_black.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG48.png"; name="sweater_grey_crew.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG49.png"; name="sweater_blue_vneck.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG50.png"; name="sweater_red_cable.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG51.png"; name="sweater_black_turtle.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5828.png"; name="jeans_blue_straight.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5830.png"; name="jeans_indigo_slim.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5831.png"; name="jeans_black_skinny.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5832.png"; name="jeans_light_wash.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5833.png"; name="jeans_dark_denim.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5834.png"; name="jeans_grey_tapered.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5771.png"; name="chinos_beige.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5772.png"; name="chinos_navy.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5773.png"; name="chinos_khaki.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5774.png"; name="chinos_grey.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG124.png"; name="shorts_beige_chino.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG125.png"; name="shorts_navy_cotton.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5790.png"; name="sneakers_white_low.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5791.png"; name="sneakers_black_canvas.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5792.png"; name="sneakers_red_retro.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5793.png"; name="sneakers_blue_runner.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5794.png"; name="sneakers_grey_suede.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5795.png"; name="sneakers_cream_minimal.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5796.png"; name="sneakers_navy_sport.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7791.png"; name="boots_brown_chelsea.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7792.png"; name="boots_black_combat.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7793.png"; name="boots_tan_desert.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7791.png"; name="shoes_black_oxford.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7792.png"; name="shoes_brown_loafer.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5816.png"; name="runners_black_sport.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5817.png"; name="runners_white_performance.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG15.png"; name="backpack_black_leather.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG16.png"; name="backpack_grey_minimal.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG17.png"; name="backpack_navy_laptop.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9893.png"; name="watch_silver_minimal.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9894.png"; name="watch_gold_chrono.png"},
    @{url="https://pngimg.com/uploads/belt/belt_PNG6823.png"; name="belt_black_leather.png"},
    @{url="https://pngimg.com/uploads/belt/belt_PNG6824.png"; name="belt_brown_woven.png"},
    @{url="https://pngimg.com/uploads/cap/cap_PNG5684.png"; name="cap_black_baseball.png"},
    @{url="https://pngimg.com/uploads/beanie/beanie_PNG88.png"; name="beanie_black.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6357.png"; name="sunglasses_black_aviator.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6358.png"; name="sunglasses_tortoise_wayfarer.png"}
)

$success = 0
foreach ($img in $urls) {
    if (Download-Image -url $img.url -filename $img.name) { $success++ }
}

Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "Downloaded: $success / $($urls.Count)" -ForegroundColor Green

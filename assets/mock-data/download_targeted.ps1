# Targeted download for missing categories
$outputDir = "$PSScriptRoot\images"
function Download-Image {
    param([string]$url, [string]$filename)
    $outputPath = Join-Path $outputDir $filename
    if (Test-Path $outputPath) { return $true }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] $filename" -ForegroundColor Green
        Start-Sleep -Milliseconds 300
        return $true
    }
    catch { return $false }
}

$targeted = @(
    # Jeans
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-Free-Download-PNG.png"; name="jeans_blue_classic.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-PNG-Image.png"; name="jeans_dark_blue.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-PNG-Pic.png"; name="jeans_light_blue.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-PNG.png"; name="jeans_raw_denim.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-Transparent-PNG.png"; name="jeans_slim_fit.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Jeans-PNG-Photo.png"; name="jeans_straight_leg.png"},
    
    # Chinos/Pants
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Pants-Free-Download-PNG.png"; name="pants_beige_casual.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Pants-PNG.png"; name="pants_navy_formal.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Pants-PNG-HD-Quality.png"; name="pants_grey_cotton.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Pants-Transparent-PNG.png"; name="pants_khaki.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Pants-PNG-Clipart.png"; name="pants_black_formal.png"},
    
    # Sneakers
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sneakers-Free-PNG-Image.png"; name="sneakers_white_basic.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sneakers-PNG-File.png"; name="sneakers_black_classic.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sneakers-PNG.png"; name="sneakers_red_sport.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sneakers-PNG-Image.png"; name="sneakers_blue_casual.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sneakers-Free-Download-PNG.png"; name="sneakers_grey_modern.png"},
    
    # Shorts
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Shorts-PNG-File.png"; name="shorts_black_casual.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Shorts-Free-PNG-Image.png"; name="shorts_beige_summer.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Shorts-PNG.png"; name="shorts_navy_sport.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Shorts-PNG-Image.png"; name="shorts_grey_gym.png"},
    
    # Backpacks
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Backpack-PNG-Free-Download.png"; name="backpack_black_modern.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Backpack-PNG.png"; name="backpack_grey_travel.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Backpack-PNG-Image.png"; name="backpack_blue_casual.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Backpack-Free-PNG-Image.png"; name="backpack_brown_leather_modern.png"},
    
    # Belts
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Belt-Free-Download-PNG.png"; name="belt_brown_classic.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Belt-PNG.png"; name="belt_black_formal.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/Belt-PNG-Image.png"; name="belt_tan_leather.png"},
    
    # Sunglasses
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sunglasses-Free-PNG-Image.png"; name="sunglasses_classic_black.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sunglasses-PNG.png"; name="sunglasses_aviator_gold.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sunglasses-PNG-Image.png"; name="sunglasses_wayfarer_brown.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sunglasses-PNG-Pic.png"; name="sunglasses_round_silver.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/03/Sunglasses-Transparent-PNG.png"; name="sunglasses_sport_blue.png"},
    
    # More T-shirts
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-Free-Download-PNG.png"; name="tshirt_basic_white.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-PNG.png"; name="tshirt_basic_black.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-PNG-File.png"; name="tshirt_vibrant_red.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-PNG-HD-Quality.png"; name="tshirt_cool_blue.png"},
    @{url="https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-Transparent-PNG.png"; name="tshirt_forest_green.png"}
)

$success = 0
foreach ($img in $targeted) {
    if (Download-Image -url $img.url -filename $img.name) { $success++ }
}

$totalNow = (Get-ChildItem -Path "$outputDir\*.png").Count
Write-Host "`nDownloaded: $success" -ForegroundColor Green
Write-Host "Total now: $totalNow images" -ForegroundColor Cyan

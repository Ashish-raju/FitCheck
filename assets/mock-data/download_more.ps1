# Download additional 92 images to reach 150 total
$outputDir = "$PSScriptRoot\images"
function Download-Image {
    param([string]$url, [string]$filename)
    $outputPath = Join-Path $outputDir $filename
    if (Test-Path $outputPath) { Write-Host "[SKIP] $filename exists"; return $true }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] $filename" -ForegroundColor Green
        Start-Sleep -Milliseconds 400
        return $true
    }
    catch {
        Write-Host "[FAIL] $filename" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n=== Downloading Additional Images ===" -ForegroundColor Cyan

$additionalUrls = @(
    # More T-Shirts
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5448.png"; name="tshirt_maroon.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5449.png"; name="tshirt_orange.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5450.png"; name="tshirt_purple.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5451.png"; name="tshirt_pink.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5452.png"; name="tshirt_cyan.png"},
    
    # More Hoodies
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG94.png"; name="hoodie_red.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG95.png"; name="hoodie_green.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG96.png"; name="hoodie_burgundy.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG97.png"; name="hoodie_blue.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG98.png"; name="hoodie_yellow.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG99.png"; name="hoodie_purple.png"},
    
    # More Shirts
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8119.png"; name="shirt_black_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8120.png"; name="shirt_purple_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8121.png"; name="shirt_green_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8122.png"; name="shirt_red_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8123.png"; name="shirt_navy_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8124.png"; name="shirt_brown_dress.png"},
    
    # More Jackets
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8051.png"; name="jacket_casual_grey.png"},
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8052.png"; name="jacket_field_green.png"},
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8053.png"; name="jacket_denim_blue.png"},
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8054.png"; name="jacket_windbreaker_navy.png"},
    @{url="https://pngimg.com/uploads/jacket/jacket_PNG8055.png"; name="jacket_puffer_black.png"},
    
    # More Sweaters
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG52.png"; name="sweater_green_knit.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG53.png"; name="sweater_burgundy_wool.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG54.png"; name="sweater_cream_cashmere.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG55.png"; name="sweater_navy_quarter.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG56.png"; name="sweater_brown_vneck.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG57.png"; name="sweater_white_crew.png"},
    
    # More Jeans
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5835.png"; name="jeans_vintage_fade.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5836.png"; name="jeans_distressed.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5837.png"; name="jeans_selvedge_raw.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5838.png"; name="jeans_black_stretch.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5839.png"; name="jeans_white_denim.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5840.png"; name="jeans_brown_vintage.png"},
    
    # More Chinos/Pants
    @{url="https://pngimg.com/uploads/pants/pants_PNG5775.png"; name="chinos_black.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5776.png"; name="chinos_olive.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5777.png"; name="chinos_burgundy.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5778.png"; name="trousers_charcoal.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5779.png"; name="trousers_navy_wool.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5780.png"; name="trousers_grey_dress.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5781.png"; name="trousers_brown_corduroy.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5782.png"; name="trousers_tan_wool.png"},
    
    # More Shorts
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG126.png"; name="shorts_grey_athletic.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG127.png"; name="shorts_black_sport.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG128.png"; name="shorts_cargo_olive.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG129.png"; name="shorts_white_casual.png"},
    @{url="https://pngimg.com/uploads/shorts/shorts_PNG130.png"; name="shorts_red_athletic.png"},
    
    # More Sneakers
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5797.png"; name="sneakers_green_low.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5798.png"; name="sneakers_brown_leather.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5799.png"; name="sneakers_white_knit.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5800.png"; name="sneakers_black_minimal.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5801.png"; name="sneakers_beige_slip.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5802.png"; name="sneakers_purple_high.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5803.png"; name="sneakers_yellow_retro.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5804.png"; name="sneakers_orange_sport.png"},
    
    # More Boots
    @{url="https://pngimg.com/uploads/boots/boots_PNG7794.png"; name="boots_brown_brogue.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7795.png"; name="boots_black_ankle.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7796.png"; name="boots_burgundy_leather.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7797.png"; name="boots_grey_chukka.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7798.png"; name="boots_navy_lace.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7799.png"; name="boots_brown_work.png"},
    
    # More Dress Shoes
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7793.png"; name="shoes_tan_suede.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7794.png"; name="shoes_burgundy_monk.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7795.png"; name="shoes_navy_driver.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7796.png"; name="shoes_cognac_brogue.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7797.png"; name="shoes_black_derby.png"},
    @{url="https://pngimg.com/uploads/dress_shoes/dress_shoes_PNG7798.png"; name="shoes_brown_penny.png"},
    
    # More Running Shoes
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5818.png"; name="runners_blue_training.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5819.png"; name="runners_grey_cushion.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5820.png"; name="runners_neon_athletic.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5821.png"; name="runners_red_sport.png"},
    @{url="https://pngimg.com/uploads/running_shoes/running_shoes_PNG5822.png"; name="runners_green_trail.png"},
    
    # Backpacks
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG18.png"; name="backpack_tan_canvas.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG19.png"; name="backpack_olive_utility.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG20.png"; name="backpack_brown_vintage.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG21.png"; name="backpack_black_tech.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG22.png"; name="backpack_beige_casual.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG23.png"; name="backpack_red_sport.png"},
    @{url="https://pngimg.com/uploads/backpack/backpack_PNG24.png"; name="backpack_blue_school.png"},
    
    # More Watches
    @{url="https://pngimg.com/uploads/watches/watches_PNG9895.png"; name="watch_black_sport.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9896.png"; name="watch_rose_gold_dress.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9897.png"; name="watch_brown_vintage.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9898.png"; name="watch_blue_diver.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9899.png"; name="watch_grey_smart.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9900.png"; name="watch_steel_pilot.png"},
    @{url="https://pngimg.com/uploads/watches/watches_PNG9901.png"; name="watch_green_military.png"},
    
    # More Caps/Hats
    @{url="https://pngimg.com/uploads/cap/cap_PNG5685.png"; name="cap_navy_snapback.png"},
    @{url="https://pngimg.com/uploads/cap/cap_PNG5686.png"; name="cap_white_dad.png"},
    @{url="https://pngimg.com/uploads/cap/cap_PNG5687.png"; name="cap_grey_trucker.png"},
    @{url="https://pngimg.com/uploads/beanie/beanie_PNG89.png"; name="beanie_grey.png"},
    @{url="https://pngimg.com/uploads/beanie/beanie_PNG90.png"; name="beanie_navy.png"},
    @{url="https://pngimg.com/uploads/hat/hat_PNG5689.png"; name="hat_tan_bucket.png"},
    @{url="https://pngimg.com/uploads/hat/hat_PNG5690.png"; name="hat_grey_fedora.png"},
    
    # More Sunglasses
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6359.png"; name="sunglasses_silver_round.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6360.png"; name="sunglasses_brown_rectangular.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6361.png"; name="sunglasses_clear_acetate.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6362.png"; name="sunglasses_gold_pilot.png"},
    @{url="https://pngimg.com/uploads/sunglasses/sunglasses_PNG6363.png"; name="sunglasses_blue_mirror.png"}
)

$success = 0
foreach ($img in $additionalUrls) {
    if (Download-Image -url $img.url -filename $img.name) { $success++ }
}

$totalNow = (Get-ChildItem -Path "$outputDir\*.png").Count
Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "New downloads: $success" -ForegroundColor Green
Write-Host "Total images now: $totalNow" -ForegroundColor Cyan

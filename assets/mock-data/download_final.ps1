# Final batch to reach 150+ images
$outputDir = "$PSScriptRoot\images"
function Download-Image {
    param([string]$url, [string]$filename)
    $outputPath = Join-Path $outputDir $filename
    if (Test-Path $outputPath) { return $true }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing -ErrorAction Stop -TimeoutSec 30
        Write-Host "[OK] $filename" -ForegroundColor Green
        Start-Sleep -Milliseconds 350
        return $true
    }
    catch {
        Write-Host "[FAIL] $filename" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "`n=== Final Download Batch ===" -ForegroundColor Cyan

$finalBatch = @(
    # Polo Shirts
    @{url="https://pngimg.com/uploads/polo_shirt/polo_shirt_PNG8187.png"; name="polo_white.png"},
    @{url="https://pngimg.com/uploads/polo_shirt/polo_shirt_PNG8188.png"; name="polo_black.png"},
    @{url="https://pngimg.com/uploads/polo_shirt/polo_shirt_PNG8189.png"; name="polo_navy.png"},
    @{url="https://pngimg.com/uploads/polo_shirt/polo_shirt_PNG8190.png"; name="polo_red.png"},
    @{url="https://pngimg.com/uploads/polo_shirt/polo_shirt_PNG8191.png"; name="polo_green.png"},
    
    # Tank Tops/Vests
    @{url="https://pngimg.com/uploads/tank_top/tank_top_PNG19.png"; name="tank_white.png"},
    @{url="https://pngimg.com/uploads/tank_top/tank_top_PNG20.png"; name="tank_black.png"},
    @{url="https://pngimg.com/uploads/tank_top/tank_top_PNG21.png"; name="tank_grey.png"},
    
    # Joggers/Sweatpants
    @{url="https://pngimg.com/uploads/sweatpants/sweatpants_PNG69.png"; name="joggers_black.png"},
    @{url="https://pngimg.com/uploads/sweatpants/sweatpants_PNG70.png"; name="joggers_grey.png"},
    @{url="https://pngimg.com/uploads/sweatpants/sweatpants_PNG71.png"; name="joggers_navy.png"},
    @{url="https://pngimg.com/uploads/sweatpants/sweatpants_PNG72.png"; name="joggers_olive.png"},
    
    # Sandals/Slides
    @{url="https://pngimg.com/uploads/sandals/sandals_PNG68.png"; name="sandals_black_leather.png"},
    @{url="https://pngimg.com/uploads/sandals/sandals_PNG69.png"; name="sandals_brown.png"},
    @{url="https://pngimg.com/uploads/sandals/sandals_PNG70.png"; name="slides_grey.png"},
    
    # Bags
    @{url="https://pngimg.com/uploads/bag/bag_PNG6702.png"; name="bag_messenger_tan.png"},
    @{url="https://pngimg.com/uploads/bag/bag_PNG6703.png"; name="bag_tote_black.png"},
    @{url="https://pngimg.com/uploads/bag/bag_PNG6704.png"; name="bag_duffle_navy.png"},
    @{url="https://pngimg.com/uploads/briefcase/briefcase_PNG21.png"; name="briefcase_brown_leather.png"},
    @{url="https://pngimg.com/uploads/briefcase/briefcase_PNG22.png"; name="briefcase_black_leather.png"},
    
    # Scarves
    @{url="https://pngimg.com/uploads/scarf/scarf_PNG56.png"; name="scarf_grey_wool.png"},
    @{url="https://pngimg.com/uploads/scarf/scarf_PNG57.png"; name="scarf_navy_cashmere.png"},
    @{url="https://pngimg.com/uploads/scarf/scarf_PNG58.png"; name="scarf_camel_checked.png"},
    @{url="https://pngimg.com/uploads/scarf/scarf_PNG59.png"; name="scarf_red_knit.png"},
    
    # More varied items to diversify
    @{url="https://pngimg.com/uploads/vest/vest_PNG59.png"; name="vest_black.png"},
    @{url="https://pngimg.com/uploads/vest/vest_PNG60.png"; name="vest_navy.png"},
    @{url="https://pngimg.com/uploads/blazer/blazer_PNG46.png"; name="blazer_navy.png"},
    @{url="https://pngimg.com/uploads/blazer/blazer_PNG47.png"; name="blazer_grey.png"},
    @{url="https://pngimg.com/uploads/blazer/blazer_PNG48.png"; name="blazer_black.png"},
    
    # Tie variants (accessories)
    @{url="https://pngimg.com/uploads/tie/tie_PNG11.png"; name="tie_navy.png"},
    @{url="https://pngimg.com/uploads/tie/tie_PNG12.png"; name="tie_red.png"},
    @{url="https://pngimg.com/uploads/tie/tie_PNG13.png"; name="tie_black.png"},
    
    # More diverse clothing to hit 150
    @{url="https://pngimg.com/uploads/coat/coat_PNG36.png"; name="coat_navy_peacoat.png"},
    @{url="https://pngimg.com/uploads/coat/coat_PNG37.png"; name="coat_grey_overcoat.png"},
    @{url="https://pngimg.com/uploads/coat/coat_PNG38.png"; name="coat_black_trench.png"},
    @{url="https://pngimg.com/uploads/coat/coat_PNG39.png"; name="coat_beige_trench.png"},
    
    # Alternative images with different numbers to ensure variety
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5453.png"; name="tshirt_brown.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5454.png"; name="tshirt_aqua.png"},
    @{url="https://pngimg.com/uploads/tshirt/tshirt_PNG5455.png"; name="tshirt_lime.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG101.png"; name="hoodie_orange.png"},
    @{url="https://pngimg.com/uploads/hoodie/hoodie_PNG102.png"; name="hoodie_pink.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8125.png"; name="shirt_yellow_dress.png"},
    @{url="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8126.png"; name="shirt_orange_dress.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG58.png"; name="sweater_orange.png"},
    @{url="https://pngimg.com/uploads/sweater/sweater_PNG59.png"; name="sweater_pink.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5841.png"; name="jeans_grey_ripped.png"},
    @{url="https://pngimg.com/uploads/jeans/jeans_PNG5842.png"; name="jeans_blue_bootcut.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5783.png"; name="chinos_white.png"},
    @{url="https://pngimg.com/uploads/pants/pants_PNG5784.png"; name="chinos_red.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5805.png"; name="sneakers_pink.png"},
    @{url="https://pngimg.com/uploads/sneakers/sneakers_PNG5806.png"; name="sneakers_mint.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7800.png"; name="boots_cognac_chelsea.png"},
    @{url="https://pngimg.com/uploads/boots/boots_PNG7801.png"; name="boots_olive_combat.png"}
)

$success = 0
foreach ($img in $finalBatch) {
    if (Download-Image -url $img.url -filename $img.name) { $success++ }
}

$totalFinal = (Get-ChildItem -Path "$outputDir\*.png").Count
Write-Host "`n=== Final Count ===" -ForegroundColor Cyan
Write-Host "Downloaded in final batch: $success" -ForegroundColor Green
Write-Host "TOTAL IMAGES: $totalFinal" -ForegroundColor Cyan

if ($totalFinal -ge 150) {
    Write-Host "`n🎉 SUCCESS! Reached 150+ images!" -ForegroundColor Green
} else {
    Write-Host "`nCurrent: $totalFinal / 150 (need $($150 - $totalFinal) more)" -ForegroundColor Yellow
}

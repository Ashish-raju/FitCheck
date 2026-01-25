import { Piece, Category } from "../../truth/types";

// All downloaded images organized by category
const TSHIRTS = [
    { image: require("./images/tshirt_white_basic.png"), color: "White", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_basic_white.png"), color: "White", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_black_basic.png"), color: "Black", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_basic_black.png"), color: "Black", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_grey_basic.png"), color: "Grey", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_navy_basic.png"), color: "Navy", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_red_basic.png"), color: "White", subcategory: "Long Sleeve" }, // Fixed: Image is White Long Sleeve
    { image: require("./images/tshirt_vibrant_red.png"), color: "Red", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_blue_basic.png"), color: "Blue", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_green_basic.png"), color: "Green", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_yellow_basic.png"), color: "Yellow", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_maroon.png"), color: "Grey", subcategory: "T-Shirt" }, // Fixed: Image is Grey
    { image: require("./images/tshirt_orange.png"), color: "Orange", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_purple.png"), color: "Purple", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_pink.png"), color: "Pink", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_cyan.png"), color: "Cyan", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_aqua.png"), color: "Aqua", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_brown.png"), color: "Pink", subcategory: "T-Shirt" }, // Fixed: Image is Pink
    // AI Generated Additions
    { image: require("./images/tshirt_black_vneck_1769377173548.png"), color: "Black", subcategory: "V-Neck" },
    { image: require("./images/tshirt_burgundy_long_1769377237635.png"), color: "Burgundy", subcategory: "Long Sleeve" },
    { image: require("./images/tshirt_charcoal_basic_1769377267009.png"), color: "Charcoal", subcategory: "T-Shirt" },
    { image: require("./images/tshirt_cream_oversized_1769377252861.png"), color: "Cream", subcategory: "Oversized Tee" },
    { image: require("./images/tshirt_grey_pocket_1769377188363.png"), color: "Grey", subcategory: "Pocket Tee" },
    { image: require("./images/tshirt_navy_striped_1769377202083.png"), color: "Navy", subcategory: "Striped Tee" },
    { image: require("./images/tshirt_olive_henley_1769377216755.png"), color: "Olive", subcategory: "Henley" },
    { image: require("./images/tshirt_white_crew_1769377158035.png"), color: "White", subcategory: "Crew Neck" },
];

const SHIRTS = [
    { image: require("./images/shirt_white_minimalist_1769291380313.png"), color: "White", subcategory: "Oxford Shirt" },
    { image: require("./images/shirt_white_dress.png"), color: "White", subcategory: "Dress Shirt" },
    { image: require("./images/shirt_blue_oxford_1769291405660.png"), color: "Navy", subcategory: "Oxford Shirt" },
    { image: require("./images/shirt_blue_dress.png"), color: "Blue", subcategory: "Dress Shirt" },
    { image: require("./images/shirt_pink_dress.png"), color: "Pink", subcategory: "Dress Shirt" },
    { image: require("./images/shirt_black_tshirt_1769291392637.png"), color: "Black", subcategory: "Casual Shirt" },
    { image: require("./images/shirt_patterned_casual_1769291418890.png"), color: "Grey", subcategory: "Patterned Shirt" },
    { image: require("./images/shirt_flannel_streetwear_1769291433914.png"), color: "Brown", subcategory: "Flannel" },
    // AI Generated Additions
    { image: require("./images/shirt_black_poplin_1769377334241.png"), color: "Black", subcategory: "Poplin Shirt" },
    { image: require("./images/shirt_blue_chambray_1769377298487.png"), color: "Blue", subcategory: "Chambray Shirt" },
    { image: require("./images/shirt_denim_dark_1769377382507.png"), color: "Indigo", subcategory: "Denim Shirt" },
    { image: require("./images/shirt_green_flannel_1769377351351.png"), color: "Green", subcategory: "Flannel" },
    { image: require("./images/shirt_grey_check_1769377366194.png"), color: "Grey", subcategory: "Check Shirt" },
    { image: require("./images/shirt_pink_linen_1769377318814.png"), color: "Pink", subcategory: "Linen Shirt" },
    { image: require("./images/shirt_white_oxford_1769377282787.png"), color: "White", subcategory: "Oxford Shirt" },
];

const SWEATERS = [
    { image: require("./images/sweater_grey_crew.png"), color: "Navy", subcategory: "Crew Neck" }, // Image appears Navy
    { image: require("./images/sweater_blue_vneck.png"), color: "Blue", subcategory: "V-Neck" },
    { image: require("./images/sweater_black_turtle.png"), color: "Black", subcategory: "Turtleneck" },
    { image: require("./images/sweater_red_cable.png"), color: "Red", subcategory: "Cable Knit" },
    { image: require("./images/sweater_navy_quarter.png"), color: "Navy", subcategory: "Sweater" },
    { image: require("./images/sweater_burgundy_wool.png"), color: "Burgundy", subcategory: "Sweater" },
    { image: require("./images/sweater_cream_cashmere.png"), color: "Cream", subcategory: "Cashmere" },
    { image: require("./images/sweater_green_knit.png"), color: "Green", subcategory: "Sweater" },
    { image: require("./images/sweater_brown_vneck.png"), color: "Brown", subcategory: "V-Neck" },
    { image: require("./images/sweater_white_crew.png"), color: "White", subcategory: "Sweater" },
    { image: require("./images/sweater_orange.png"), color: "Red", subcategory: "Graphic Sweater" }, // "I Just Like Teaching..." is Red
    { image: require("./images/sweater_pink.png"), color: "Pink", subcategory: "Sweater" },
    // AI Generated Additions
    { image: require("./images/sweater_grey_cable_1769377421519.png"), color: "Grey", subcategory: "Cable Knit" },
    { image: require("./images/sweater_navy_crewneck_1769377405862.png"), color: "Navy", subcategory: "Crew Neck" },
];

const JACKETS = [
    { image: require("./images/jacket_leather_black.png"), color: "Black", subcategory: "Leather Jacket" },
    { image: require("./images/jacket_leather_brown.png"), color: "Brown", subcategory: "Leather Jacket" },
    { image: require("./images/jacket_bomber_black.png"), color: "Black", subcategory: "Bomber Jacket" },
    { image: require("./images/jacket_denim_blue.png"), color: "Denim", subcategory: "Denim Jacket" },
    { image: require("./images/jacket_field_green.png"), color: "Orange", subcategory: "Field Jacket" }, // Fixed: Image is Orange
    { image: require("./images/jacket_casual_grey.png"), color: "Grey", subcategory: "Jacket" },
    { image: require("./images/jacket_puffer_black.png"), color: "Black", subcategory: "Puffer Jacket" },
    { image: require("./images/jacket_windbreaker_navy.png"), color: "Navy", subcategory: "Windbreaker" },
];

const COATS = [
    { image: require("./images/coat_navy_peacoat.png"), color: "Navy", subcategory: "Peacoat" },
    { image: require("./images/coat_grey_overcoat.png"), color: "Grey", subcategory: "Overcoat" },
    { image: require("./images/coat_black_trench.png"), color: "Black", subcategory: "Trench Coat" },
    { image: require("./images/coat_beige_trench.png"), color: "Beige", subcategory: "Trench Coat" },
];

const BOTTOMS = [
    { image: require("./images/pants_beige_chinos_1769291832497.png"), color: "Beige", subcategory: "Chinos" },
    { image: require("./images/pants_black_cropped_1769291818202.png"), color: "Black", subcategory: "Jeans" },
    { image: require("./images/pants_denim_indigo_1769291869436.png"), color: "Indigo", subcategory: "Jeans" },
    { image: require("./images/pants_grey_wool_1769291853652.png"), color: "Grey", subcategory: "Wool Trousers" },
    { image: require("./images/pants_olive_cargo_1769291882181.png"), color: "Olive", subcategory: "Cargo Pants" },
];

const BOOTS = [
    { image: require("./images/boots_brown_chelsea.png"), color: "Brown", subcategory: "Chelsea Boots" },
    { image: require("./images/boots_black_combat.png"), color: "Black", subcategory: "Combat Boots" },
    { image: require("./images/boots_tan_desert.png"), color: "Tan", subcategory: "Desert Boots" },
    { image: require("./images/boots_brown_brogue.png"), color: "Brown", subcategory: "Brogue Boots" },
    { image: require("./images/boots_black_ankle.png"), color: "Black", subcategory: "Ankle Boots" },
    { image: require("./images/boots_burgundy_leather.png"), color: "Burgundy", subcategory: "Boots" },
    { image: require("./images/boots_grey_chukka.png"), color: "Beige", subcategory: "Chukka Boots" }, // Commonly mislabeled
    { image: require("./images/boots_navy_lace.png"), color: "Navy", subcategory: "Lace-Up Boots" },
    { image: require("./images/boots_brown_work.png"), color: "Tan", subcategory: "Work Boots" }, // Typically Tan/Wheat
    { image: require("./images/boots_cognac_chelsea.png"), color: "Cognac", subcategory: "Chelsea Boots" },
    { image: require("./images/boots_olive_combat.png"), color: "Olive", subcategory: "Combat Boots" },
];

const SNEAKERS = [
    { image: require("./images/shoes_white_sneakers_1769291896158.png"), color: "White", subcategory: "Sneakers" },
];

const RUNNERS = [
    { image: require("./images/runners_black_sport.png"), color: "Black", subcategory: "Running Shoes" },
    { image: require("./images/runners_white_performance.png"), color: "White", subcategory: "Running Shoes" },
    { image: require("./images/runners_blue_training.png"), color: "Yellow", subcategory: "Running Shoes" }, // Fixed: Image is Yellow
    { image: require("./images/runners_grey_cushion.png"), color: "Grey", subcategory: "Running Shoes" },
    { image: require("./images/runners_neon_athletic.png"), color: "Neon", subcategory: "Athletic Shoes" },
    { image: require("./images/runners_red_sport.png"), color: "Red", subcategory: "Running Shoes" },
    { image: require("./images/runners_green_trail.png"), color: "Green", subcategory: "Trail Shoes" },
];

const DRESS_SHOES = [
    { image: require("./images/shoes_brown_loafers_1769291923879.png"), color: "Brown", subcategory: "Loafers" },
    { image: require("./images/shoes_black_derbies_1769291955831.png"), color: "Black", subcategory: "Derbies" },
    { image: require("./images/shoes_grey_runners_1769291938062.png"), color: "Grey", subcategory: "Runners" },
    { image: require("./images/shoes_black_boots_1769291909320.png"), color: "Black", subcategory: "Boots" },
];

const ACCESSORIES = [
    { image: require("./images/watch_silver_minimal.png"), color: "Silver", subcategory: "Watch" },
    { image: require("./images/watch_gold_chrono.png"), color: "Gold", subcategory: "Watch" },
    { image: require("./images/watch_black_sport.png"), color: "Black", subcategory: "Smartwatch" },
    { image: require("./images/watch_rose_gold_dress.png"), color: "Rose Gold", subcategory: "Watch" },
    { image: require("./images/watch_brown_vintage.png"), color: "Brown", subcategory: "Watch" },
    { image: require("./images/watch_blue_diver.png"), color: "Blue", subcategory: "Diver Watch" },
    { image: require("./images/watch_grey_smart.png"), color: "Grey", subcategory: "Smartwatch" },
    { image: require("./images/watch_steel_pilot.png"), color: "Steel", subcategory: "Pilot Watch" },
    { image: require("./images/watch_green_military.png"), color: "Green", subcategory: "Military Watch" },
    { image: require("./images/cap_black_baseball.png"), color: "Grey", subcategory: "Baseball Cap" }, // Often grey/black melange
    { image: require("./images/cap_navy_snapback.png"), color: "Navy", subcategory: "Snapback" },
    { image: require("./images/cap_white_dad.png"), color: "Navy", subcategory: "Dad Cap" }, // Fixed: Image is Blue
    { image: require("./images/cap_grey_trucker.png"), color: "White", subcategory: "Trucker Cap" }, // Visual is white mesh
    { image: require("./images/hat_tan_bucket.png"), color: "Tan", subcategory: "Bucket Hat" },
    { image: require("./images/hat_grey_fedora.png"), color: "Grey", subcategory: "Fedora" },
    { image: require("./images/scarf_grey_wool.png"), color: "Grey", subcategory: "Scarf" },
    { image: require("./images/scarf_navy_cashmere.png"), color: "Navy", subcategory: "Scarf" },
    { image: require("./images/scarf_camel_checked.png"), color: "Camel", subcategory: "Scarf" },
    { image: require("./images/scarf_red_knit.png"), color: "Red", subcategory: "Scarf" },
    { image: require("./images/backpack_brown_leather_modern.png"), color: "Brown", subcategory: "Backpack" },
    { image: require("./images/backpack_grey_travel.png"), color: "Grey", subcategory: "Backpack" },
    { image: require("./images/backpack_blue_casual.png"), color: "Blue", subcategory: "Backpack" },
];

const BRANDS = ["Uniqlo", "Acne Studios", "Common Projects", "A.P.C.", "COS", "Margaret Howell", "Norse Projects", "Our Legacy", "Lemaire", "Auralee", "The Row", "Jil Sander", "Maison Margiela", "Loro Piana", "Brunello Cucinelli"];
const STYLE_TAGS = ["Minimalist", "Streetwear", "Workwear", "Casual", "Smart Casual", "Athleisure", "Contemporary", "Classic"];

function createPiecesFromTemplates(
    category: Category,
    templates: Array<{ image: any; color: string; subcategory: string }>,
    idPrefix: string
): Piece[] {
    return templates.map((template, i) => {
        const nameLower = template.subcategory.toLowerCase();
        let material = 'cotton';
        let pattern = 'solid';

        // Infer Material
        if (nameLower.includes('leather') || nameLower.includes('boots')) material = 'leather'; // Boots default to leather
        else if (nameLower.includes('denim') || nameLower.includes('jeans')) material = 'denim';
        else if (nameLower.includes('wool') || nameLower.includes('knit')) material = 'wool';
        else if (nameLower.includes('silk')) material = 'silk';
        else if (nameLower.includes('linen')) material = 'linen';
        else if (nameLower.includes('cashmere')) material = 'cashmere';
        else if (nameLower.includes('suede') || nameLower.includes('desert') || nameLower.includes('chukka')) material = 'suede';
        else if (nameLower.includes('sport') || nameLower.includes('running') || nameLower.includes('athletic')) material = 'polyester';

        // Infer Pattern
        if (nameLower.includes('stripe')) pattern = 'stripe';
        else if (nameLower.includes('check')) pattern = 'checks';
        else if (nameLower.includes('graphic')) pattern = 'graphic';
        else if (nameLower.includes('floral')) pattern = 'floral';

        return {
            id: `${idPrefix}_${i + 1}`,
            category,
            name: `${template.color} ${template.subcategory}`,
            brand: BRANDS[i % BRANDS.length],
            subcategory: template.subcategory,
            price: 100 + Math.floor(Math.random() * 300),
            imageUri: template.image,
            status: "Clean",
            warmth: getWarmthScore(template.subcategory),
            formality: getFormalityScore(template.subcategory),
            color: template.color,
            material, // New field
            pattern, // New field 
            fit: 'regular',
            styleTags: [STYLE_TAGS[i % STYLE_TAGS.length]],
            dateAdded: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
            currentUses: 0,
            maxUses: 3,
        } as Piece;
    });
}

function getWarmthScore(subcategory: string): number {
    const warmCategories: Record<string, number> = {
        "Puffer Jacket": 5, "Overcoat": 5, "Peacoat": 5, "Trench Coat": 4,
        "Sweater": 4, "Cable Knit": 4, "Turtleneck": 4, "Cashmere": 4,
        "Leather Jacket": 3, "Bomber Jacket": 3, "Field Jacket": 3,
        "Flannel": 3, "Dress Shirt": 2, "Oxford Shirt": 2,
        "T-Shirt": 1, "Casual Shirt": 2,
    };
    return warmCategories[subcategory] || 2;
}

function getFormalityScore(subcategory: string): number {
    const formalCategories: Record<string, number> = {
        "Dress Shirt": 5, "Trench Coat": 5, "Overcoat": 5, "Peacoat": 4,
        "Oxford Shirt": 4, "Cashmere": 4, "Loafers": 5, "Derbies": 5,
        "Chelsea Boots": 4, "Brogue Boots": 4, "Trousers": 4, "Chinos": 3,
        "Sweater": 3, "V-Neck": 3, "Bomber Jacket": 2, "Denim Jacket": 2,
        "T-Shirt": 1, "Sneakers": 1, "Running Shoes": 1, "Athletic Shoes": 1,
        "Baseball Cap": 1, "Snapback": 1,
    };
    return formalCategories[subcategory] || 2;
}

// Combine tops (excluding outerwear)
const TOPS = [...TSHIRTS, ...SHIRTS, ...SWEATERS];

// Combine outerwear
const OUTERWEAR = [...JACKETS, ...COATS];

// Combine all shoes
const ALL_SHOES = [...BOOTS, ...SNEAKERS, ...RUNNERS, ...DRESS_SHOES];

// Generate wardrobe with all 117 images
export const MOCK_PIECES: Piece[] = [
    ...createPiecesFromTemplates("Top", TOPS, "top"),
    ...createPiecesFromTemplates("Outerwear", OUTERWEAR, "layer"),
    ...createPiecesFromTemplates("Bottom", BOTTOMS, "bottom"),
    ...createPiecesFromTemplates("Shoes", ALL_SHOES, "shoes"),
    ...createPiecesFromTemplates("Accessory", ACCESSORIES, "acc"),
];
import { Piece } from "../../truth/types";

// Available images with their actual descriptions
const TOPS = [
    { image: require("./images/shirt_white_minimalist_1769291380313.png"), color: "White", subcategory: "T-Shirt" },
    { image: require("./images/shirt_black_tshirt_1769291392637.png"), color: "Black", subcategory: "T-Shirt" },
    { image: require("./images/shirt_blue_oxford_1769291405660.png"), color: "Navy", subcategory: "Oxford Shirt" },
    { image: require("./images/shirt_patterned_casual_1769291418890.png"), color: "Grey", subcategory: "Casual Shirt" },
    { image: require("./images/shirt_flannel_streetwear_1769291433914.png"), color: "Brown", subcategory: "Flannel" },
];

const BOTTOMS = [
    { image: require("./images/pants_beige_chinos_1769291832497.png"), color: "Beige", subcategory: "Chinos" },
    { image: require("./images/pants_black_cropped_1769291818202.png"), color: "Black", subcategory: "Jeans" },
    { image: require("./images/pants_denim_indigo_1769291869436.png"), color: "Navy", subcategory: "Jeans" },
    { image: require("./images/pants_grey_wool_1769291853652.png"), color: "Grey", subcategory: "Trousers" },
    { image: require("./images/pants_olive_cargo_1769291882181.png"), color: "Olive", subcategory: "Cargo Pants" },
];

const SHOES = [
    { image: require("./images/shoes_white_sneakers_1769291896158.png"), color: "White", subcategory: "Sneakers" },
    { image: require("./images/shoes_black_boots_1769291909320.png"), color: "Black", subcategory: "Boots" },
    { image: require("./images/shoes_brown_loafers_1769291923879.png"), color: "Brown", subcategory: "Loafers" },
    { image: require("./images/shoes_grey_runners_1769291938062.png"), color: "Grey", subcategory: "Runners" },
    { image: require("./images/shoes_black_derbies_1769291955831.png"), color: "Black", subcategory: "Derbies" },
];

const BRANDS = ["Uniqlo", "Acne Studios", "Common Projects", "A.P.C.", "COS", "Margaret Howell", "Norse Projects", "Our Legacy", "Lemaire", "Auralee"];
const STYLE_TAGS = ["Minimalist", "Streetwear", "Workwear", "Casual", "Smart Casual"];

function generateItems(
    category: "Top" | "Bottom" | "Shoes",
    count: number,
    itemTemplates: Array<{ image: any; color: string; subcategory: string }>,
    startId: number
): Piece[] {
    const items: Piece[] = [];

    for (let i = 0; i < count; i++) {
        const template = itemTemplates[i % itemTemplates.length];

        items.push({
            id: `${category.toLowerCase()}_${startId + i}`,
            category,
            name: `${template.color} ${template.subcategory}`, // e.g., "Beige Chinos", "Black T-Shirt"
            brand: BRANDS[i % BRANDS.length],
            subcategory: template.subcategory,
            price: 100 + Math.floor(Math.random() * 200),
            imageUri: template.image,
            status: "Clean",
            warmth: Math.floor(Math.random() * 5) + 1,
            formality: Math.floor(Math.random() * 5) + 1,
            color: template.color,
            styleTags: [STYLE_TAGS[i % STYLE_TAGS.length]],
            dateAdded: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
            currentUses: 0,
            maxUses: 3,
        } as Piece);
    }
    return items;
}

export const MOCK_PIECES: Piece[] = [
    ...generateItems("Top", 50, TOPS, 1),
    ...generateItems("Bottom", 50, BOTTOMS, 1),
    ...generateItems("Shoes", 50, SHOES, 1),
];
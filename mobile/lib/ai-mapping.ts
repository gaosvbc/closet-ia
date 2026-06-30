import type { ClothingCategory, ClothingItem, ClothingShape, GarmentSlot } from "@/types";

// The AI classifies directly into the app's Spanish wardrobe categories
// (see lib/ai/clothing-analysis.ts prompts), so no AI↔UI category
// conversion is needed. This just picks the abstract card shape used for
// presentational variety on the wardrobe grid.
const CATEGORY_SHAPE: Record<ClothingCategory, ClothingShape> = {
  Prendas: "tall-rect",
  Zapatos: "pill",
  Accesorios: "square",
  Bolsos: "pentagon",
};

export function categoryToShape(category: ClothingCategory): ClothingShape {
  return CATEGORY_SHAPE[category] ?? "square";
}

function isClothingCategory(value: string): value is ClothingCategory {
  return value in CATEGORY_SHAPE;
}

const GARMENT_SLOTS: readonly GarmentSlot[] = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "footwear",
  "accessory",
  "bag",
  "na",
];

function isGarmentSlot(value: string): value is GarmentSlot {
  return (GARMENT_SLOTS as readonly string[]).includes(value);
}

// Best-effort free-text color name → swatch hex, for the abstract card
// rendering. Falls back to a neutral grey when nothing matches.
const COLOR_SWATCHES: { match: RegExp; hex: string }[] = [
  { match: /black/i, hex: "#171717" },
  { match: /white|ivory|cream/i, hex: "#F7F4EF" },
  { match: /navy|dark ?blue/i, hex: "#1B2A4A" },
  { match: /blue|denim/i, hex: "#6F8798" },
  { match: /red|wine|maroon|burgundy/i, hex: "#8B1524" },
  { match: /beige|tan|khaki/i, hex: "#D8C9B8" },
  { match: /brown/i, hex: "#6B4A2F" },
  { match: /gr[ae]y/i, hex: "#8C8580" },
  { match: /green|olive/i, hex: "#3F5A45" },
  { match: /pink/i, hex: "#D98C9E" },
  { match: /gold|mustard|yellow/i, hex: "#C8A45D" },
  { match: /purple|lavender/i, hex: "#6E5A8C" },
  { match: /orange/i, hex: "#C8703D" },
];

export function colorNameToHex(colorName: string): string {
  for (const { match, hex } of COLOR_SWATCHES) {
    if (match.test(colorName)) return hex;
  }
  return "#8C8580";
}

// Shape of a row from the `clothing_items` Supabase table (see
// supabase/migrations/002_vision_ai.sql), translated into the app's existing
// presentational ClothingItem type.
export interface ClothingItemRow {
  id: string;
  image_url: string | null;
  name: string | null;
  type: string | null;
  garment_slot: string | null;
  color: string | null;
  category: string | null;
  material: string | null;
  pattern: string | null;
  season: string | null;
  formality: string | null;
  ideal_temp_min: number | null;
  ideal_temp_max: number | null;
  occasions: string[] | null;
  style_descriptors: string[] | null;
  pairing_suggestions: string | null;
  favorited: boolean | null;
}

export function dbRowToClothingItem(row: ClothingItemRow): ClothingItem {
  const category: ClothingCategory =
    row.category && isClothingCategory(row.category) ? row.category : "Prendas";
  return {
    id: row.id,
    name: row.name || row.type || "Prenda sin nombre",
    color: colorNameToHex(row.color || "grey"),
    shape: categoryToShape(category),
    category,
    favorited: Boolean(row.favorited),
    imageUri: row.image_url ?? undefined,
    type: row.type ?? undefined,
    garmentSlot: row.garment_slot && isGarmentSlot(row.garment_slot) ? row.garment_slot : undefined,
    material: row.material ?? undefined,
    pattern: row.pattern ?? undefined,
    season: row.season ?? undefined,
    formality: row.formality ?? undefined,
    idealTempRangeCelsius:
      row.ideal_temp_min != null && row.ideal_temp_max != null
        ? { min: row.ideal_temp_min, max: row.ideal_temp_max }
        : undefined,
    occasions: row.occasions ?? undefined,
    styleDescriptors: row.style_descriptors ?? undefined,
    pairingSuggestions: row.pairing_suggestions ?? undefined,
  };
}

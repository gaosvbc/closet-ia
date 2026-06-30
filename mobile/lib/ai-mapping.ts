import type { ClothingCategory, ClothingItem, ClothingShape } from "@/types";

// Maps the AI's English category to the app's existing Spanish wardrobe
// categories and abstract card shape, both of which predate this feature
// and are presentational only.
const CATEGORY_MAP: Record<string, { category: ClothingCategory; shape: ClothingShape }> = {
  top: { category: "Prendas", shape: "tall-rect" },
  bottom: { category: "Prendas", shape: "tall-rect" },
  outerwear: { category: "Prendas", shape: "pentagon" },
  footwear: { category: "Zapatos", shape: "pill" },
  accessory: { category: "Accesorios", shape: "square" },
};

export function mapAiCategory(aiCategory: string): { category: ClothingCategory; shape: ClothingShape } {
  return CATEGORY_MAP[aiCategory] ?? { category: "Prendas", shape: "square" };
}

// Reverse of the above, for writing a user-edited Spanish category back to
// the AI-shaped `category` column (constrained to top/bottom/footwear/
// accessory/outerwear in clothing_items). "Prendas" covers three AI
// categories so this picks the most common one ("top"); "Bolsos" has no AI
// equivalent so it falls back to "accessory" — both are best-effort, not a
// lossless round trip.
const REVERSE_CATEGORY_MAP: Record<ClothingCategory, string> = {
  Prendas: "top",
  Zapatos: "footwear",
  Accesorios: "accessory",
  Bolsos: "accessory",
};

export function mapCategoryToAi(category: ClothingCategory): string {
  return REVERSE_CATEGORY_MAP[category];
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
  const { category, shape } = mapAiCategory(row.category ?? "");
  return {
    id: row.id,
    name: row.name || row.type || "Prenda sin nombre",
    color: colorNameToHex(row.color || "grey"),
    shape,
    category,
    favorited: Boolean(row.favorited),
    imageUri: row.image_url ?? undefined,
    type: row.type ?? undefined,
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

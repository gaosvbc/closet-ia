import type { ClothingCategory, ClothingShape } from "@/types";

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

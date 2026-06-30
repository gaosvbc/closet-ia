export type ClothingShape = "tall-rect" | "pentagon" | "pill" | "square";

export type ClothingCategory =
  | "Prendas"
  | "Zapatos"
  | "Accesorios"
  | "Bolsos";

export interface ClothingItem {
  id: string;
  name: string;
  color: string;
  shape: ClothingShape;
  category: ClothingCategory;
  favorited: boolean;
  imageUri?: string;
  // AI-derived fields (Claude Vision). Populated to the depth the user's
  // plan allows — undefined fields simply mean that tier doesn't include
  // them, not that analysis failed.
  type?: string;
  material?: string;
  pattern?: string;
  season?: string;
  formality?: string;
  idealTempRangeCelsius?: { min: number; max: number };
  occasions?: string[];
  styleDescriptors?: string[];
  pairingSuggestions?: string;
}

// AI clothing analysis result shape returned by /api/analyze-clothing.
// Mirrors lib/ai/clothing-analysis.ts on the web side. Tiered: Essential
// returns only the base fields; Pro adds material/pattern/season/formality;
// Elite adds the rest. All extra fields are optional since lower tiers omit
// them.
export interface ClothingAnalysis {
  type: string;
  color: string;
  category: "top" | "bottom" | "footwear" | "accessory" | "outerwear";
  material?: string;
  pattern?: string;
  season?: string;
  formality?: string;
  idealTempRangeCelsius?: { min: number; max: number };
  occasions?: string[];
  styleDescriptors?: string[];
  pairingSuggestions?: string;
}

export interface Look {
  id: string;
  title: string;
  date: string;
  favorited: boolean;
  items: string[]; // array of color hex strings (4 swatches)
}

export interface BodyProfile {
  height: string;
  weight: string;
  bodyType: string;
  fitPreference: string;
  genderExpression: string;
}

export interface UserProfile {
  name: string;
  fullName: string;
  email: string;
  styleTag: string;
  bodyProfile: BodyProfile;
  stats: {
    prendas: number;
    looks: number;
    favoritos: number;
  };
}

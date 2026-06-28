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

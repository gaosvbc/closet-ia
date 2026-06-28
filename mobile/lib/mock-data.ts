import type { ClothingItem, Look, UserProfile } from "@/types";

// The single source of demo data shown in mock mode (no Supabase configured).
// Values match the design spec exactly.

export const userProfile: UserProfile = {
  name: "Valeria",
  fullName: "Valeria Andrade",
  email: "valeria@email.com",
  styleTag: "Estilo · Minimalista clásico",
  bodyProfile: {
    height: "168 cm",
    weight: "58 kg",
    bodyType: "Atlético",
    fitPreference: "Regular",
    genderExpression: "Femenino",
  },
  stats: { prendas: 68, looks: 12, favoritos: 5 },
};

export const clothingItems: ClothingItem[] = [
  { id: "1", name: "Blazer vino", color: "#8B1524", shape: "tall-rect", category: "Prendas", favorited: true },
  { id: "2", name: "Camisa blanca", color: "#F7F4EF", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "3", name: "Pantalón negro", color: "#171717", shape: "pentagon", category: "Prendas", favorited: false },
  { id: "4", name: "Bolso negro", color: "#0A0A0A", shape: "pentagon", category: "Bolsos", favorited: false },
  { id: "5", name: "Camisa beige", color: "#D8C9B8", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "6", name: "Jeans denim", color: "#6F8798", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "7", name: "Top vino", color: "#8B1524", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "8", name: "Abrigo negro", color: "#1A1A1A", shape: "pentagon", category: "Prendas", favorited: true },
  { id: "9", name: "Jersey crema", color: "#EDE8E0", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "10", name: "Falda negra", color: "#171717", shape: "tall-rect", category: "Prendas", favorited: false },
  { id: "11", name: "Botines beige", color: "#C8A45D", shape: "pill", category: "Zapatos", favorited: false },
  { id: "12", name: "Collar dorado", color: "#C8A45D", shape: "pill", category: "Accesorios", favorited: false },
];

export const looks: Look[] = [
  {
    id: "1",
    title: "Reunión de trabajo",
    date: "Hoy · 10:00 AM",
    favorited: false,
    items: ["#8B1524", "#F7F4EF", "#171717", "#1A1A1A"],
  },
  {
    id: "2",
    title: "Cena con amigas",
    date: "Sábado · 8:00 PM",
    favorited: true,
    items: ["#0A0A0A", "#8B1524", "#C8A45D", "#C8A45D"],
  },
  {
    id: "3",
    title: "Día casual",
    date: "Domingo",
    favorited: false,
    items: ["#EDE8E0", "#6F8798", "#D8C9B8", "#171717"],
  },
  {
    id: "4",
    title: "Brunch de domingo",
    date: "Guardado",
    favorited: true,
    items: ["#EDE8E0", "#8B1524", "#F7F4EF", "#D8C9B8"],
  },
];

// Categories for the wardrobe filter pills.
export const categories = ["Todo", "Prendas", "Zapatos", "Accesorios"] as const;
export type CategoryFilter = (typeof categories)[number];

// Shared, framework-agnostic constants used across pages, forms, and the
// admin dashboard. Keeping these in one place keeps copy consistent and makes
// the validation MVP easy to iterate on.

export type BillingPreference = "monthly" | "annual";

export interface Plan {
  key: "free" | "basic" | "pro";
  name: string;
  monthly: number;
  annual: number | null;
  annualSaving: number | null; // percentage
  tagline: string;
  features: string[];
  mostPopular?: boolean;
}

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    annual: null,
    annualSaving: null,
    tagline: "Perfect to try the concept",
    features: [
      "Catalogue up to 15 items",
      "3 outfit suggestions per week",
      "No weather or calendar integration",
    ],
  },
  {
    key: "basic",
    name: "Basic",
    monthly: 3.99,
    annual: 34.99,
    annualSaving: 27,
    tagline: "For everyday styling",
    features: [
      "Unlimited wardrobe catalogue",
      "Daily outfit suggestion",
      "Real-time weather integration",
      "Save favourite outfits",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 6.99,
    annual: 59.99,
    annualSaving: 30,
    tagline: "For the fully optimised wardrobe",
    mostPopular: true,
    features: [
      "Everything in Basic",
      "Calendar-aware styling (meeting vs casual day)",
      "Outfit repeat tracker",
      "Cost-per-wear insights",
      "Trip packing assistant",
      "Priority access to new features",
    ],
  },
];

export interface FeatureVoteOption {
  key: string;
  emoji: string;
  label: string;
  blurb: string;
}

export const FEATURES: FeatureVoteOption[] = [
  {
    key: "weather_outfit",
    emoji: "🌤",
    label: "Weather-based daily outfit suggestion",
    blurb: "The right layers for today, before you open the wardrobe.",
  },
  {
    key: "calendar_styling",
    emoji: "📅",
    label: "Calendar-aware styling",
    blurb: "Know what the day needs — a review, a dinner, a quiet desk day.",
  },
  {
    key: "cost_per_wear",
    emoji: "💸",
    label: "Cost-per-wear tracker",
    blurb:
      "“This coat cost $200 and you haven't worn it in 9 months.”",
  },
  {
    key: "trip_packing",
    emoji: "🧳",
    label: "Trip packing assistant",
    blurb: "Pack only what you need, nothing more.",
  },
  {
    key: "repeat_tracker",
    emoji: "🔁",
    label: "Outfit repeat tracker",
    blurb: "Never repeat the same look at the same event.",
  },
  {
    key: "capsule_builder",
    emoji: "📦",
    label: "Capsule wardrobe builder",
    blurb: "Find your perfect minimal set.",
  },
];

// Demo wardrobe — a deliberately gender-neutral mix of feminine and
// masculine garment types.
export interface WardrobeItem {
  label: string;
  category: string;
}

export const DEMO_WARDROBE: WardrobeItem[] = [
  { label: "White Shirt", category: "Tops" },
  { label: "Navy Blazer", category: "Outerwear" },
  { label: "Black Trousers", category: "Bottoms" },
  { label: "Silk Blouse", category: "Tops" },
  { label: "Grey Coat", category: "Outerwear" },
  { label: "White Sneakers", category: "Shoes" },
  { label: "Camel Trench", category: "Outerwear" },
  { label: "Blue Denim", category: "Bottoms" },
];

export const SURVEY_QUESTIONS = {
  wardrobeSizeOptions: ["<20", "20-50", "50-100", "100+"],
  minutesOptions: ["<5", "5-10", "10-20", "20+"],
} as const;

// Shared, framework-agnostic constants for Visual Closet Tracker V2.
// One source of truth for plans, features, the demo wardrobe, and the body
// profile options used by onboarding.

export type BillingPreference = "monthly" | "annual";

export interface Plan {
  key: "essential" | "pro";
  name: string;
  monthly: number;
  annual: number | null;
  annualSaving: number | null; // percentage
  tagline: string;
  features: string[];
  mostPopular?: boolean;
}

// Every plan starts with a free trial — no free tier. Users can cancel during
// the trial and pay nothing.
export const TRIAL_DAYS = 7;

export const PLANS: Plan[] = [
  {
    key: "essential",
    name: "Essential",
    monthly: 4.99,
    annual: 39.99,
    annualSaving: 33,
    tagline: "For everyday dressing",
    features: [
      "Unlimited wardrobe catalogue",
      "Daily outfit suggestion with weather",
      "Full body profile + fit intelligence",
      "Save and favourite outfits",
      "Outfit history log",
      "No watermark",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 8.99,
    annual: 69.99,
    annualSaving: 35,
    tagline: "The fully optimised wardrobe",
    mostPopular: true,
    features: [
      "Everything in Essential",
      "Real Google Calendar sync",
      "Event-aware outfit suggestions",
      "Cost-per-wear tracker with alerts",
      "Outfit repeat tracker",
      "Trip packing assistant (calendar-aware)",
      "Capsule wardrobe builder",
      "Priority feature access",
    ],
  },
];

// Feature voting. Icons are Lucide names (rendered as thin line icons) — no
// emojis in the UI, per the design system.
export interface FeatureVoteOption {
  key: string;
  icon: string;
  label: string;
  blurb: string;
}

export const FEATURES: FeatureVoteOption[] = [
  {
    key: "body_fit",
    icon: "Ruler",
    label: "Body-fit intelligence",
    blurb: "Outfits sized and styled for your actual measurements.",
  },
  {
    key: "calendar_styling",
    icon: "CalendarClock",
    label: "Calendar-aware styling",
    blurb: "Dressed for every meeting, every occasion.",
  },
  {
    key: "cost_per_wear",
    icon: "Wallet",
    label: "Cost-per-wear tracker",
    blurb: "Know which clothes are worth their price.",
  },
  {
    key: "trip_packing",
    icon: "Luggage",
    label: "Trip packing assistant",
    blurb: "Pack only what you need, nothing more.",
  },
  {
    key: "repeat_tracker",
    icon: "Repeat",
    label: "Outfit repeat tracker",
    blurb: "Never repeat at the same event.",
  },
  {
    key: "capsule_builder",
    icon: "Package",
    label: "Capsule wardrobe builder",
    blurb: "Find your perfect minimal set.",
  },
  {
    key: "weather_outfit",
    icon: "CloudSun",
    label: "Weather-based daily outfit",
    blurb: "Always dressed for the actual day.",
  },
  {
    key: "size_guide",
    icon: "Tag",
    label: "Size guide by brand",
    blurb: "Your size in every brand, automatically.",
  },
];

// Demo wardrobe — nine pieces, a deliberately even mix of feminine and
// masculine garment types. `worn` powers the "worn X times" counter.
export interface WardrobeItem {
  label: string;
  category: string;
  worn: number;
}

export const DEMO_WARDROBE: WardrobeItem[] = [
  { label: "White Oxford Shirt", category: "Tops", worn: 18 },
  { label: "Navy Blazer", category: "Outerwear", worn: 9 },
  { label: "Black Tailored Trousers", category: "Bottoms", worn: 22 },
  { label: "Silk Blouse", category: "Tops", worn: 4 },
  { label: "Camel Trench", category: "Outerwear", worn: 6 },
  { label: "White Sneakers", category: "Shoes", worn: 31 },
  { label: "Grey Wool Coat", category: "Outerwear", worn: 11 },
  { label: "Dark Denim", category: "Bottoms", worn: 27 },
  { label: "Black Chelsea Boots", category: "Shoes", worn: 14 },
];

// -------------------- Body profile options (onboarding) --------------------

export const BODY_TYPES = [
  "Slim",
  "Athletic",
  "Average",
  "Curvy",
  "Plus",
] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const FIT_PREFERENCES = ["Relaxed", "Regular", "Fitted"] as const;
export type FitPreference = (typeof FIT_PREFERENCES)[number];

export const GENDER_EXPRESSIONS = [
  "Feminine",
  "Masculine",
  "Neutral",
  "Mix",
] as const;
export type GenderExpression = (typeof GENDER_EXPRESSIONS)[number];

export const WARDROBE_CHALLENGES = [
  "I never know what to wear",
  "I repeat the same outfits",
  "I have too much and use too little",
  "I don't dress appropriately for occasions",
  "I want to look more put-together",
] as const;
export type WardrobeChallenge = (typeof WARDROBE_CHALLENGES)[number];

// Numeric bounds (also enforced in Zod). Height in cm, weight in kg.
export const HEIGHT_BOUNDS_CM = { min: 50, max: 250 } as const;
export const WEIGHT_BOUNDS_KG = { min: 20, max: 300 } as const;

// -------------------- Survey (embedded in waitlist) --------------------

export const SURVEY = {
  q1: {
    label: "How many minutes do you spend deciding what to wear each morning?",
    options: ["<5", "5-10", "10-20", "20+"],
  },
  q2: {
    label: "How many items are in your wardrobe?",
    options: ["<30", "30-60", "60-100", "100+"],
  },
  q3: {
    label: "Have you ever tried a wardrobe app before?",
    options: ["Yes, still use it", "Yes, abandoned it", "No"],
  },
  q4: {
    label: "Would you pay for an app that solved this?",
    options: ["Yes", "No", "Maybe"],
  },
} as const;

// -------------------- Comparison table (landing) --------------------

export const COMPARISON = {
  competitors: ["Visual Closet Tracker", "Alta Daily", "Smart Closet"],
  rows: [
    { label: "Body-fit intelligence", values: [true, false, false] },
    { label: "Calendar integration", values: [true, false, false] },
    { label: "Cost-per-wear", values: [true, false, false] },
    { label: "Gender-neutral", values: [true, false, false] },
    { label: "Private — no social feed", values: [true, false, true] },
    { label: "Outfit repeat tracker", values: [true, false, false] },
  ],
} as const;

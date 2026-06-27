import { z } from "zod";
import {
  BODY_TYPES,
  FIT_PREFERENCES,
  GENDER_EXPRESSIONS,
  WARDROBE_CHALLENGES,
  HEIGHT_BOUNDS_CM,
  WEIGHT_BOUNDS_KG,
} from "@/lib/constants";

// All inbound payloads are validated with Zod before they touch Supabase.
// Errors are caught in the API routes and never surfaced raw to the user.

const emailSchema = z
  .string()
  .trim()
  .min(3, "Please enter a valid email")
  .max(254, "Email is too long")
  .email("Please enter a valid email");

// ---------------------------- Waitlist + survey ----------------------------
export const waitlistSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().max(80).optional().or(z.literal("")),
  consentEmail: z.boolean().default(true),
  // Honeypot — must stay empty. Bots tend to fill every field.
  company: z.string().max(0).optional().or(z.literal("")),

  // Onboarding survey (4 questions) — stored as text.
  q1MinutesDeciding: z.enum(["<5", "5-10", "10-20", "20+"]).optional(),
  q2WardrobeSize: z.enum(["<30", "30-60", "60-100", "100+"]).optional(),
  q3TriedAppBefore: z
    .enum(["Yes, still use it", "Yes, abandoned it", "No"])
    .optional(),
  q4WouldPay: z.enum(["Yes", "No", "Maybe"]).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

// ---------------------------- Onboarding / body ----------------------------
// Body measurements are normalised to metric (cm / kg) on the client before
// submission. Bounds are enforced here as defense-in-depth.
export const onboardingSchema = z.object({
  email: emailSchema,
  heightCm: z
    .number()
    .min(HEIGHT_BOUNDS_CM.min, "Please enter a realistic height")
    .max(HEIGHT_BOUNDS_CM.max, "Please enter a realistic height")
    .optional(),
  weightKg: z
    .number()
    .min(WEIGHT_BOUNDS_KG.min, "Please enter a realistic weight")
    .max(WEIGHT_BOUNDS_KG.max, "Please enter a realistic weight")
    .optional(),
  bodyType: z.enum(BODY_TYPES).optional(),
  fitPreference: z.enum(FIT_PREFERENCES).optional(),
  genderExpression: z.enum(GENDER_EXPRESSIONS).optional(),
  biggestChallenge: z.enum(WARDROBE_CHALLENGES).optional(),
  // Explicit opt-in is REQUIRED to store any body measurement data.
  consentBodyData: z.boolean().default(false),
  // Honeypot.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ---------------------------- Votes & events ----------------------------
export const featureVoteSchema = z.object({
  email: emailSchema.optional().or(z.literal("")),
  featureKey: z.string().trim().min(1).max(64),
  featureLabel: z.string().trim().min(1).max(160),
});

export type FeatureVoteInput = z.infer<typeof featureVoteSchema>;

export const priceVoteSchema = z.object({
  email: emailSchema.optional().or(z.literal("")),
  planSelected: z.enum(["free", "essential", "pro"]),
  billingPreference: z.enum(["monthly", "annual"]).optional(),
});

export type PriceVoteInput = z.infer<typeof priceVoteSchema>;

export const pageEventSchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  metadata: z.record(z.unknown()).optional(),
});

export type PageEventInput = z.infer<typeof pageEventSchema>;

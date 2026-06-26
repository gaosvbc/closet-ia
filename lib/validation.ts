import { z } from "zod";

// All inbound payloads are validated with Zod before they touch Supabase.
// Errors are caught in the API routes and never surfaced raw to the user.

const emailSchema = z
  .string()
  .trim()
  .min(3, "Please enter a valid email")
  .max(254, "Email is too long")
  .email("Please enter a valid email");

// Waitlist + onboarding survey. The survey lives inside the waitlist form, so
// the survey fields are optional — a lead can sign up without completing it.
export const waitlistSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().max(80).optional().or(z.literal("")),
  wardrobeSize: z
    .enum(["<20", "20-50", "50-100", "100+"])
    .optional(),
  currentSolution: z.string().trim().max(280).optional().or(z.literal("")),
  consentEmail: z.boolean().default(true),
  // Honeypot — must stay empty. Bots tend to fill every field.
  company: z.string().max(0).optional().or(z.literal("")),

  // Onboarding survey (4 questions)
  q1MorningStress: z.coerce.number().int().min(1).max(5).optional(),
  q2WardrobePieces: z.coerce.number().int().min(0).max(100000).optional(),
  q3MinutesDeciding: z.coerce.number().int().min(0).max(1440).optional(),
  q4WouldPay: z.enum(["yes", "no", "maybe"]).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const featureVoteSchema = z.object({
  email: emailSchema.optional().or(z.literal("")),
  featureKey: z.string().trim().min(1).max(64),
  featureLabel: z.string().trim().min(1).max(160),
});

export type FeatureVoteInput = z.infer<typeof featureVoteSchema>;

export const priceVoteSchema = z.object({
  email: emailSchema.optional().or(z.literal("")),
  planSelected: z.enum(["free", "basic", "pro"]),
  billingPreference: z.enum(["monthly", "annual"]).optional(),
});

export type PriceVoteInput = z.infer<typeof priceVoteSchema>;

export const pageEventSchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  metadata: z.record(z.unknown()).optional(),
});

export type PageEventInput = z.infer<typeof pageEventSchema>;

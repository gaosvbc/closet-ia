import { z } from "zod";

// Mirrors the email rule used on the web (lib/validation.ts). Password
// minimum is the only new rule the GOAL spec asks for client-side, since
// Supabase Auth owns hashing/storage entirely.
export const emailSchema = z
  .string()
  .trim()
  .min(3, "Please enter a valid email")
  .max(254, "Email is too long")
  .email("Please enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password"),
});

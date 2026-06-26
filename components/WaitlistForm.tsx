"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { waitlistSchema } from "@/lib/validation";
import { SURVEY_QUESTIONS } from "@/lib/constants";

// Waitlist capture + 4-question onboarding survey in one form. Validated with
// Zod on the client for instant feedback, and again on the server. Includes a
// honeypot field ("company") that real users never see. On success it swaps to
// an inline confirmation — the same copy whether Supabase is connected or in
// fallback mode, so the experience never reveals backend state.

type FieldErrors = Partial<Record<string, string>>;

export default function WaitlistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded border border-line">
          <Check strokeWidth={1.5} className="h-6 w-6 accent-text" />
        </div>
        <h2 className="mt-6 text-2xl">You&apos;re on the list.</h2>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          We&apos;ll be in touch soon. Thank you for helping shape your
          wardrobe&apos;s smartest assistant.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    const form = e.currentTarget;
    const fd = new FormData(form);

    const raw = {
      email: String(fd.get("email") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      // The wardrobe-size range doubles as the lead's wardrobe_size enum.
      wardrobeSize: (fd.get("q2WardrobePieces") as string) || undefined,
      currentSolution: String(fd.get("currentSolution") ?? ""),
      consentEmail: fd.get("consentEmail") === "on",
      company: String(fd.get("company") ?? ""), // honeypot
      q1MorningStress: fd.get("q1MorningStress")
        ? Number(fd.get("q1MorningStress"))
        : undefined,
      q2WardrobePieces: fd.get("q2WardrobePieces")
        ? mapWardrobePieces(String(fd.get("q2WardrobePieces")))
        : undefined,
      q3MinutesDeciding: fd.get("q3MinutesDeciding")
        ? mapMinutes(String(fd.get("q3MinutesDeciding")))
        : undefined,
      q4WouldPay: (fd.get("q4WouldPay") as string) || undefined,
    };

    const parsed = waitlistSchema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !json?.ok) {
        setFormError(json?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setFormError("Network issue. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* Contact */}
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">
            Email <span className="accent-text">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="field-input"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-ink">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="firstName" className="field-label">
            First name <span className="text-muted">(optional)</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Alex"
            className="field-input"
          />
        </div>
      </div>

      {/* Honeypot — visually hidden, off-screen, not focusable. */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px]">
        <label htmlFor="company">Company (leave this empty)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Onboarding survey */}
      <fieldset className="space-y-6 border-t border-line pt-8">
        <legend className="eyebrow">A few quick questions (optional)</legend>

        <div>
          <span className="field-label">
            1. How stressful is getting dressed in the morning?
          </span>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex-1 cursor-pointer rounded border border-line py-2.5 text-center text-sm text-ink transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="q1MorningStress"
                  value={n}
                  className="sr-only"
                />
                {n}
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Effortless</span>
            <span>Very stressful</span>
          </div>
        </div>

        <div>
          <label htmlFor="q2WardrobePieces" className="field-label">
            2. Roughly how many items are in your wardrobe?
          </label>
          <select
            id="q2WardrobePieces"
            name="q2WardrobePieces"
            className="field-input"
            defaultValue=""
          >
            <option value="" disabled>
              Select a range
            </option>
            {SURVEY_QUESTIONS.wardrobeSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} items
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="q3MinutesDeciding" className="field-label">
            3. How many minutes do you spend deciding what to wear?
          </label>
          <select
            id="q3MinutesDeciding"
            name="q3MinutesDeciding"
            className="field-input"
            defaultValue=""
          >
            <option value="" disabled>
              Select a range
            </option>
            {SURVEY_QUESTIONS.minutesOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} minutes
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="field-label">
            4. Would you pay for an app that solved this?
          </span>
          <div className="mt-3 flex gap-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "maybe", label: "Maybe" },
              { value: "no", label: "No" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex-1 cursor-pointer rounded border border-line py-2.5 text-center text-sm text-ink transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="q4WouldPay"
                  value={opt.value}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="flex items-start gap-3">
        <input
          id="consentEmail"
          name="consentEmail"
          type="checkbox"
          defaultChecked
          className="mt-1 h-4 w-4 rounded-sm border-line accent-ink"
        />
        <label htmlFor="consentEmail" className="text-sm text-muted">
          It&apos;s fine to email me occasional updates about the launch. No
          spam, unsubscribe any time.
        </label>
      </div>

      {formError && (
        <p className="rounded border border-line bg-white px-4 py-3 text-sm text-ink">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? "Joining…" : "Join the waitlist — it's free"}
      </button>

      <p className="text-center text-xs text-muted">
        We never store images, body data, or location beyond an optional city
        name.
      </p>
    </form>
  );
}

function mapWardrobePieces(range: string): number {
  switch (range) {
    case "<20":
      return 15;
    case "20-50":
      return 35;
    case "50-100":
      return 75;
    case "100+":
      return 120;
    default:
      return 0;
  }
}

function mapMinutes(range: string): number {
  switch (range) {
    case "<5":
      return 4;
    case "5-10":
      return 8;
    case "10-20":
      return 15;
    case "20+":
      return 25;
    default:
      return 0;
  }
}

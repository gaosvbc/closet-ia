"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { waitlistSchema } from "@/lib/validation";
import { SURVEY } from "@/lib/constants";

// Waitlist capture + 4-question survey in one form. Validated with Zod on the
// client for instant feedback, and again on the server. Includes a honeypot
// field ("company") that real users never see. On success it swaps to an inline
// confirmation — identical copy whether Supabase is connected or in fallback
// mode, so the experience never reveals backend state.

type FieldErrors = Partial<Record<string, string>>;

export default function WaitlistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="panel p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded border border-line">
          <Check strokeWidth={1.5} className="h-6 w-6 accent-text" />
        </div>
        <h2 className="mt-6 text-2xl">You&apos;re on the list.</h2>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          We&apos;ll be in touch. Thank you for helping shape the wardrobe
          assistant that finally accounts for your body, your day, and your
          clothes.
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
      consentEmail: fd.get("consentEmail") === "on",
      company: String(fd.get("company") ?? ""), // honeypot
      q1MinutesDeciding: (fd.get("q1MinutesDeciding") as string) || undefined,
      q2WardrobeSize: (fd.get("q2WardrobeSize") as string) || undefined,
      q3TriedAppBefore: (fd.get("q3TriedAppBefore") as string) || undefined,
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
            <p className="mt-1.5 text-xs text-error">{errors.email}</p>
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

      {/* Honeypot — off-screen, not focusable. */}
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

      <fieldset className="space-y-6 border-t border-line pt-8">
        <legend className="eyebrow">A few quick questions (optional)</legend>

        <SelectQuestion
          name="q1MinutesDeciding"
          label={`1. ${SURVEY.q1.label}`}
          options={SURVEY.q1.options}
          suffix=" minutes"
        />
        <SelectQuestion
          name="q2WardrobeSize"
          label={`2. ${SURVEY.q2.label}`}
          options={SURVEY.q2.options}
          suffix=" items"
        />
        <SelectQuestion
          name="q3TriedAppBefore"
          label={`3. ${SURVEY.q3.label}`}
          options={SURVEY.q3.options}
        />

        <div>
          <span className="field-label">4. {SURVEY.q4.label}</span>
          <div className="mt-3 flex gap-2">
            {SURVEY.q4.options.map((opt) => (
              <label key={opt} className="choice flex-1">
                <input
                  type="radio"
                  name="q4WouldPay"
                  value={opt}
                  className="sr-only"
                />
                {opt}
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
          It&apos;s fine to email me occasional updates about early access. No
          spam, unsubscribe any time.
        </label>
      </div>

      {formError && (
        <p className="rounded-input border border-line bg-surface px-4 py-3 text-sm text-error">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? "Joining…" : "Get early access — free"}
      </button>

      <p className="text-center text-xs text-muted">
        We never store images or body data without your explicit consent.
      </p>
    </form>
  );
}

function SelectQuestion({
  name,
  label,
  options,
  suffix = "",
}: {
  name: string;
  label: string;
  options: readonly string[];
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <select id={name} name={name} className="field-input" defaultValue="">
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
            {suffix}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import {
  BODY_TYPES,
  FIT_PREFERENCES,
  GENDER_EXPRESSIONS,
  WARDROBE_CHALLENGES,
  type BodyType,
  type FitPreference,
  type GenderExpression,
  type WardrobeChallenge,
} from "@/lib/constants";
import { onboardingSchema } from "@/lib/validation";
import { logEvent } from "@/lib/analytics";

// Five-step onboarding (simulation only). Progress bar, back button, and no
// required fields except email on the final step. Body measurements are only
// sent — and only stored — if the user explicitly opts in.

const TOTAL_STEPS = 5;

type HeightUnit = "cm" | "ftin";
type WeightUnit = "kg" | "lbs";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Record that an onboarding session started, so the admin dashboard can
  // compute a completion rate (start → finish).
  useEffect(() => {
    void logEvent("onboarding_start");
  }, []);

  // Body measurements
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [bodyType, setBodyType] = useState<BodyType | "">("");
  const [fitPreference, setFitPreference] = useState<FitPreference | "">("");
  const [consentBody, setConsentBody] = useState(false);

  // Style + challenge
  const [genderExpression, setGenderExpression] = useState<
    GenderExpression | ""
  >("");
  const [challenge, setChallenge] = useState<WardrobeChallenge | "">("");

  // Email
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function computeHeightCm(): number | undefined {
    if (heightUnit === "cm") {
      const v = parseFloat(heightCmInput);
      return Number.isFinite(v) ? Math.round(v) : undefined;
    }
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    if (ft === 0 && inch === 0) return undefined;
    return Math.round((ft * 12 + inch) * 2.54);
  }

  function computeWeightKg(): number | undefined {
    const v = parseFloat(weightInput);
    if (!Number.isFinite(v)) return undefined;
    return weightUnit === "kg" ? Math.round(v) : Math.round(v * 0.453592);
  }

  async function submit() {
    setError(null);

    const payload = {
      email: email.trim(),
      heightCm: computeHeightCm(),
      weightKg: computeWeightKg(),
      bodyType: bodyType || undefined,
      fitPreference: fitPreference || undefined,
      genderExpression: genderExpression || undefined,
      biggestChallenge: challenge || undefined,
      consentBodyData: consentBody,
      company: "",
    };

    const parsed = onboardingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      void logEvent("onboarding_complete", {
        provided_measurements: consentBody && Boolean(computeHeightCm()),
      });
      setDone(true);
    } catch {
      setError("Network issue. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Shell step={TOTAL_STEPS}>
        <div className="panel p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded border border-line">
            <Check strokeWidth={1.5} className="h-6 w-6 accent-text" />
          </div>
          <h1 className="mt-6 text-3xl">Your profile is ready.</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            You&apos;re on the early-access list. We&apos;ll be in touch when
            it&apos;s your turn to see it in action.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary">
              Explore the demo
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell step={step}>
      {/* Step 1 — Welcome */}
      {step === 1 && (
        <StepFrame
          title="Let's set up your style profile."
          subtitle="Takes about 3 minutes. No required fields until the very end."
        >
          <div className="mt-8">
            <button type="button" onClick={next} className="btn btn-primary">
              Start
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
        </StepFrame>
      )}

      {/* Step 2 — Body measurements */}
      {step === 2 && (
        <StepFrame
          title="Your measurements"
          subtitle="So every suggestion fits you — not just someone else. All optional."
        >
          <div className="mt-8 space-y-8">
            {/* Height */}
            <div>
              <div className="flex items-center justify-between">
                <span className="field-label">Height</span>
                <UnitToggle
                  options={["cm", "ftin"]}
                  labels={{ cm: "cm", ftin: "ft / in" }}
                  value={heightUnit}
                  onChange={(v) => setHeightUnit(v as HeightUnit)}
                />
              </div>
              {heightUnit === "cm" ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min={50}
                  max={250}
                  placeholder="175"
                  value={heightCmInput}
                  onChange={(e) => setHeightCmInput(e.target.value)}
                  className="field-input"
                />
              ) : (
                <div className="mt-2 flex gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="ft"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="field-input mt-0"
                    aria-label="Height feet"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="in"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="field-input mt-0"
                    aria-label="Height inches"
                  />
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <div className="flex items-center justify-between">
                <span className="field-label">Weight</span>
                <UnitToggle
                  options={["kg", "lbs"]}
                  labels={{ kg: "kg", lbs: "lbs" }}
                  value={weightUnit}
                  onChange={(v) => setWeightUnit(v as WeightUnit)}
                />
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder={weightUnit === "kg" ? "68" : "150"}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="field-input"
              />
            </div>

            {/* Body type */}
            <ChoiceGroup
              label="Body type"
              options={BODY_TYPES}
              value={bodyType}
              onChange={(v) => setBodyType(v as BodyType)}
            />

            {/* Fit preference */}
            <ChoiceGroup
              label="Fit preference"
              options={FIT_PREFERENCES}
              value={fitPreference}
              onChange={(v) => setFitPreference(v as FitPreference)}
            />

            {/* Consent */}
            <label className="flex items-start gap-3 rounded-input border border-line bg-surface p-4">
              <input
                type="checkbox"
                checked={consentBody}
                onChange={(e) => setConsentBody(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-sm border-line accent-ink"
              />
              <span className="text-sm leading-relaxed text-muted">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                  <Lock strokeWidth={1.5} className="h-3.5 w-3.5" />
                  Store my height &amp; weight to personalise fit
                </span>
                <br />
                We&apos;ll only use this to size and style suggestions for your
                body. It&apos;s never shown publicly, never shared, and never
                used for anything else. Leave this unticked and we&apos;ll skip
                storing measurements entirely.
              </span>
            </label>
          </div>

          <StepNav onBack={back} onNext={next} />
        </StepFrame>
      )}

      {/* Step 3 — Gender expression */}
      {step === 3 && (
        <StepFrame
          title="How do you express your style?"
          subtitle="This only affects style suggestions. It has nothing to do with your gender identity."
        >
          <div className="mt-8">
            <ChoiceGroup
              label=""
              options={GENDER_EXPRESSIONS}
              value={genderExpression}
              onChange={(v) => setGenderExpression(v as GenderExpression)}
            />
          </div>
          <StepNav onBack={back} onNext={next} />
        </StepFrame>
      )}

      {/* Step 4 — Biggest challenge */}
      {step === 4 && (
        <StepFrame
          title="What's your main wardrobe problem?"
          subtitle="Pick the one that sounds most like you."
        >
          <div className="mt-8 space-y-3">
            {WARDROBE_CHALLENGES.map((c) => (
              <label
                key={c}
                className="choice block w-full text-left"
                style={{ textAlign: "left" }}
              >
                <input
                  type="radio"
                  name="challenge"
                  value={c}
                  checked={challenge === c}
                  onChange={() => setChallenge(c)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>
          <StepNav onBack={back} onNext={next} />
        </StepFrame>
      )}

      {/* Step 5 — Email */}
      {step === 5 && (
        <StepFrame
          title="Your profile is ready."
          subtitle="Get early access to see it in action."
        >
          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="ob-email" className="field-label">
                Email <span className="accent-text">*</span>
              </label>
              <input
                id="ob-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? "Submitting…" : "Get early access"}
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
            >
              <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
              Back
            </button>
          </div>
        </StepFrame>
      )}
    </Shell>
  );
}

/* ---------------- layout + small building blocks ---------------- */

function Shell({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-10 md:py-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-lg">
            Visual Closet Tracker
          </Link>
          <span className="text-xs text-muted">
            Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1 w-full bg-line">
          <div
            className="h-1 bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
}

function StepFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-3 max-w-md text-muted">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
        Back
      </button>
      <button type="button" onClick={onNext} className="btn btn-primary">
        Continue
        <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
      </button>
    </div>
  );
}

function UnitToggle({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly string[];
  labels: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded border px-2.5 py-1 text-xs transition-colors ${
            value === opt
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface text-muted hover:text-ink"
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div
        className={`mt-2 grid gap-2 ${
          options.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3"
        }`}
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`rounded border px-3 py-3 text-sm transition-colors ${
              value === opt
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink hover:border-ink"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

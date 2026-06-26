"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS, type BillingPreference } from "@/lib/constants";

// Three pricing plans side by side on desktop, stacked on mobile. Pro is
// highlighted as "Most Popular". Annual savings shown clearly. Selecting a plan
// records a price_vote (or logs in fallback mode).

export default function Pricing({ heading = true }: { heading?: boolean }) {
  const [billing, setBilling] = useState<BillingPreference>("monthly");
  const [voted, setVoted] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function choosePlan(planKey: string) {
    setPending(planKey);
    try {
      await fetch("/api/price-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSelected: planKey,
          billingPreference: billing,
        }),
      });
      setVoted(planKey);
    } catch {
      // eslint-disable-next-line no-console
      console.log("[price-vote:fallback]", planKey, billing);
      setVoted(planKey);
    } finally {
      setPending(null);
    }
  }

  return (
    <section id="pricing" className="section">
      {heading && (
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl md:text-4xl">
            Simple plans. No surprises.
          </h2>
          <p className="mt-4 text-muted">
            Start free. Upgrade only when the value is obvious. Cancel any time.
          </p>
        </div>
      )}

      {/* Billing toggle */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <BillingButton
          active={billing === "monthly"}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </BillingButton>
        <BillingButton
          active={billing === "annual"}
          onClick={() => setBilling("annual")}
        >
          Annual
        </BillingButton>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const showAnnual = billing === "annual" && plan.annual !== null;
          const price = showAnnual ? plan.annual : plan.monthly;
          const isVoted = voted === plan.key;

          return (
            <div
              key={plan.key}
              className={`card relative flex flex-col p-8 ${
                plan.mostPopular ? "border-ink shadow-[0_0_0_1px_#111111]" : ""
              }`}
            >
              {plan.mostPopular && (
                <span className="absolute -top-3 left-8 bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-heading text-4xl text-ink">
                  ${price?.toFixed(2).replace(/\.00$/, "")}
                </span>
                <span className="text-sm text-muted">
                  /{showAnnual ? "year" : "month"}
                </span>
              </div>

              {plan.annual !== null && (
                <p className="mt-2 text-xs">
                  {showAnnual ? (
                    <span className="accent-text font-medium">
                      Save {plan.annualSaving}% vs monthly
                    </span>
                  ) : (
                    <span className="text-muted">
                      or ${plan.annual.toFixed(2)}/year — save{" "}
                      <span className="accent-text font-medium">
                        {plan.annualSaving}%
                      </span>
                    </span>
                  )}
                </p>
              )}
              {plan.annual === null && (
                <p className="mt-2 text-xs text-muted">Free forever</p>
              )}

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-ink">
                    <Check
                      strokeWidth={1.5}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-text"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => choosePlan(plan.key)}
                disabled={pending === plan.key || isVoted}
                className={`btn mt-8 w-full ${
                  plan.mostPopular ? "btn-primary" : "btn-outline"
                }`}
              >
                {isVoted
                  ? "Noted — thank you"
                  : pending === plan.key
                    ? "Saving…"
                    : plan.key === "free"
                      ? "Start free"
                      : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Choosing a plan registers your interest. No payment is taken — this is an
        early validation phase.
      </p>
    </section>
  );
}

function BillingButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

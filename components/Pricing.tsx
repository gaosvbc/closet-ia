"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS, TRIAL_DAYS, type BillingPreference } from "@/lib/constants";

// Three plans side by side on desktop, stacked on mobile. Pro is "Most
// Popular". Annual billing is selected by default and savings are shown
// clearly. Choosing a plan records a price_vote (or logs in fallback mode).

export default function Pricing({ heading = true }: { heading?: boolean }) {
  const [billing, setBilling] = useState<BillingPreference>("annual");
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
            Premium, not precious.
          </h2>
          <p className="mt-4 text-muted">
            Every plan starts with a {TRIAL_DAYS}-day free trial. Cancel any
            time during the trial and pay nothing.
          </p>
        </div>
      )}

      {/* Billing toggle — annual default. */}
      <div className="mt-10 flex items-center justify-center gap-2">
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
          Annual — save up to 35%
        </BillingButton>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const showAnnual = billing === "annual" && plan.annual !== null;
          const price = showAnnual ? plan.annual : plan.monthly;
          const isVoted = voted === plan.key;

          return (
            <div
              key={plan.key}
              className={`panel relative flex flex-col p-8 ${
                plan.mostPopular ? "border-2 border-accent bg-white" : ""
              }`}
            >
              {plan.mostPopular && (
                <span className="absolute -top-3 left-8 bg-accent px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
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
                      or ${plan.annual.toFixed(2)}/year —{" "}
                      <span className="accent-text font-medium">
                        save {plan.annualSaving}%
                      </span>
                    </span>
                  )}
                </p>
              )}

              <p className="mt-3 text-xs text-muted">
                Starts with a {TRIAL_DAYS}-day free trial · cancel any time
              </p>

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
                  plan.mostPopular ? "btn-primary" : "btn-ghost"
                }`}
              >
                {isVoted
                  ? "Noted — thank you"
                  : pending === plan.key
                    ? "Saving…"
                    : `Start ${TRIAL_DAYS}-day free trial`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Choosing a plan registers your interest. No payment is taken — this is an
        early access phase.
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
          ? "border-accent bg-accent text-white"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

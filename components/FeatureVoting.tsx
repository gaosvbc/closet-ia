"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { FEATURES } from "@/lib/constants";

// Six features the wardrobe could ship next. A vote records a feature_vote row
// (or logs in fallback mode). Voting is one-per-feature per session, tracked in
// local state — this is a lightweight validation signal, not an auth-gated poll.

export default function FeatureVoting() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<string | null>(null);

  async function vote(featureKey: string, featureLabel: string) {
    if (voted[featureKey]) return;
    setPending(featureKey);
    try {
      await fetch("/api/feature-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureKey, featureLabel }),
      });
    } catch {
      // eslint-disable-next-line no-console
      console.log("[feature-vote:fallback]", featureKey);
    } finally {
      setVoted((prev) => ({ ...prev, [featureKey]: true }));
      setPending(null);
    }
  }

  return (
    <section id="features" className="section border-t border-line">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Help shape the roadmap</span>
        <h2 className="mt-4 text-3xl md:text-4xl">
          Which would you use most?
        </h2>
        <p className="mt-4 text-muted">
          Vote for what matters to you. The most-wanted features ship first.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const hasVoted = voted[feature.key];
          return (
            <button
              key={feature.key}
              type="button"
              onClick={() => vote(feature.key, feature.label)}
              disabled={pending === feature.key || hasVoted}
              aria-pressed={hasVoted}
              className={`card flex flex-col items-start gap-3 p-6 text-left transition-colors ${
                hasVoted ? "border-ink" : "hover:border-ink"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {feature.emoji}
              </span>
              <span className="font-heading text-lg leading-snug text-ink">
                {feature.label}
              </span>
              <span className="text-sm text-muted">{feature.blurb}</span>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${
                  hasVoted ? "accent-text" : "text-muted"
                }`}
              >
                {hasVoted ? (
                  <>
                    <Check strokeWidth={2} className="h-3.5 w-3.5" /> Vote counted
                  </>
                ) : pending === feature.key ? (
                  "Saving…"
                ) : (
                  "Vote for this"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

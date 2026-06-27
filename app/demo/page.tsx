"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Cloud, CalendarClock, RefreshCw, ThumbsUp, User } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import GarmentCard from "@/components/GarmentCard";
import OutfitSuggestionCard, {
  type OutfitSuggestion,
} from "@/components/OutfitSuggestionCard";
import { DEMO_WARDROBE } from "@/lib/constants";
import { logEvent } from "@/lib/analytics";

// A fully interactive static simulation — zero real AI. The most important
// conversion tool on the site, so it must feel premium and real.

const SUGGESTIONS: OutfitSuggestion[] = [
  {
    items: [
      "Navy Blazer",
      "White Oxford Shirt",
      "Black Tailored Trousers",
      "Black Chelsea Boots",
    ],
    note: "For your proportions and today's agenda, we suggest the navy blazer over a white oxford with black tailored trousers and Chelsea boots. The structured blazer suits your athletic frame. The palette works from morning meeting to evening dinner without changing.",
    fitNote: "Fit-checked for your measurements",
    repeatNote: "Not worn in last 14 days",
  },
  {
    items: ["Grey Wool Coat", "White Oxford Shirt", "Dark Denim", "White Sneakers"],
    note: "A softer, off-duty register for the overcast day. The grey wool coat adds structure over the oxford, while dark denim keeps it considered. Clean sneakers carry it through lunch without effort.",
    fitNote: "Balanced for a regular fit preference",
    repeatNote: "Not worn in last 9 days",
  },
  {
    items: ["Camel Trench", "Silk Blouse", "Black Tailored Trousers", "Black Chelsea Boots"],
    note: "Elevated for the evening dinner. The camel trench warms the palette, the silk blouse softens the line, and tailored trousers keep the proportion sharp for your frame.",
    fitNote: "Lengthens an athletic silhouette",
    repeatNote: "Not worn in last 21 days",
  },
];

const BODY_PROFILE = {
  height: "175cm",
  weight: "68kg",
  type: "Athletic",
  fit: "Regular",
};

export default function DemoPage() {
  const [index, setIndex] = useState(0);
  const [loved, setLoved] = useState(false);

  const suggestion = SUGGESTIONS[index];
  const selectedLabels = useMemo(
    () => new Set(suggestion.items),
    [suggestion]
  );

  function tryAnother() {
    setLoved(false);
    setIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    void logEvent("demo_try_another", { from_index: index });
  }

  function loveThis() {
    setLoved(true);
    void logEvent("demo_love_look", { items: suggestion.items, index });
  }

  return (
    <>
      <SiteNav />
      <main className="section">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Interactive demo</span>
          <h1 className="mt-4 text-3xl md:text-5xl">
            A morning, fit-checked for you
          </h1>
          <p className="mt-4 text-muted">
            A simulation — no real AI, no real data. See how a daily suggestion
            feels when it knows your body and your day.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* LEFT — Wardrobe panel */}
          <div>
            <h2 className="text-xl">Your wardrobe</h2>
            <p className="mt-1 text-sm text-muted">
              Nine pieces, catalogued. Highlighted items are in today&apos;s
              suggestion.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {DEMO_WARDROBE.map((item) => (
                <GarmentCard
                  key={item.label}
                  label={item.label}
                  category={item.category}
                  worn={item.worn}
                  selected={selectedLabels.has(item.label)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — Intelligence panel */}
          <div className="space-y-5">
            {/* Body profile */}
            <div className="panel p-5">
              <div className="flex items-center gap-2">
                <User strokeWidth={1.25} className="h-4 w-4 text-ink" />
                <span className="eyebrow">Body profile</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Detail label="Height" value={BODY_PROFILE.height} />
                <Detail label="Weight" value={BODY_PROFILE.weight} />
                <Detail label="Type" value={BODY_PROFILE.type} />
                <Detail label="Fit" value={BODY_PROFILE.fit} />
              </div>
            </div>

            {/* Today's context */}
            <div className="panel p-5">
              <span className="eyebrow">Today&apos;s context</span>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Cloud strokeWidth={1.25} className="h-5 w-5 text-ink" />
                  <p className="text-sm text-ink">
                    Berlin · 14°C · Overcast
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarClock
                    strokeWidth={1.25}
                    className="mt-0.5 h-5 w-5 text-ink"
                  />
                  <p className="text-sm text-ink">
                    10:00 Board Meeting
                    <span className="text-muted"> · </span>
                    13:00 Lunch
                    <span className="text-muted"> · </span>
                    19:00 Dinner
                  </p>
                </div>
              </div>
            </div>

            {/* AI suggestion */}
            <OutfitSuggestionCard
              suggestion={suggestion}
              saved={loved}
              actions={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={loveThis}
                    disabled={loved}
                    className="btn btn-primary flex-1"
                  >
                    <ThumbsUp strokeWidth={1.5} className="h-4 w-4" />
                    {loved ? "Saved" : "This works for me"}
                  </button>
                  <button
                    type="button"
                    onClick={tryAnother}
                    className="btn btn-ghost flex-1"
                  >
                    <RefreshCw strokeWidth={1.5} className="h-4 w-4" />
                    Show me another
                  </button>
                </div>
              }
            />

            <p className="text-xs leading-relaxed text-muted">
              Suggestions are inspiration only — never instructions. All style
              decisions remain yours.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-12 text-center">
          <h2 className="text-2xl">Want this every morning?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Build your profile and be first in when early access opens.
          </p>
          <div className="mt-6">
            <Link href="/onboarding" className="btn btn-primary">
              Get early access — free
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-ink">{value}</p>
    </div>
  );
}

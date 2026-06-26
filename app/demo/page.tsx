"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Cloud, CalendarClock, Check, RefreshCw, Heart } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import GarmentCard from "@/components/GarmentCard";
import { DEMO_WARDROBE } from "@/lib/constants";
import { logEvent } from "@/lib/analytics";

// A fully interactive static mockup — zero real AI. The most important
// conversion tool on the site, so it must feel real and polished.

interface Suggestion {
  items: string[];
  note: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    items: ["Navy Blazer", "White Shirt", "Black Trousers"],
    note: "A clean, confident look for a focused morning. Navy blazer over white shirt, black trousers. No effort required.",
  },
  {
    items: ["Grey Coat", "Silk Blouse", "Black Trousers"],
    note: "Softer and considered. The grey coat keeps the overcast chill out while the silk blouse keeps it sharp for a review.",
  },
  {
    items: ["Camel Trench", "White Shirt", "Blue Denim"],
    note: "Relaxed but deliberate. Camel trench over a crisp white shirt and denim — easy to move in, easy to remember.",
  },
];

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
    void logEvent("demo_love_look", {
      items: suggestion.items,
      index,
    });
  }

  return (
    <>
      <SiteNav />
      <main className="section">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Interactive demo</span>
          <h1 className="mt-4 text-3xl md:text-5xl">
            A morning with Visual Closet Tracker
          </h1>
          <p className="mt-4 text-muted">
            This is a simulation — no real AI, no real data. Tap the buttons to
            see how a daily suggestion feels.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Wardrobe grid */}
          <div>
            <h2 className="text-xl">Your wardrobe</h2>
            <p className="mt-1 text-sm text-muted">
              Eight pieces, catalogued. Highlighted items are in today&apos;s
              suggestion.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {DEMO_WARDROBE.map((item) => (
                <GarmentCard
                  key={item.label}
                  label={item.label}
                  category={item.category}
                  selected={selectedLabels.has(item.label)}
                />
              ))}
            </div>
          </div>

          {/* Context + suggestion */}
          <div className="space-y-5">
            {/* Weather */}
            <div className="card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded border border-line">
                <Cloud strokeWidth={1.25} className="h-6 w-6 text-ink" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">New York</p>
                <p className="text-sm text-muted">17°C · Overcast</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded border border-line">
                <CalendarClock strokeWidth={1.25} className="h-6 w-6 text-ink" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  10:00 AM — Quarterly Review
                </p>
                <p className="text-sm text-muted">Calendar-aware styling</p>
              </div>
            </div>

            {/* AI suggestion */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Today&apos;s suggestion</span>
                {loved && (
                  <span className="inline-flex items-center gap-1 text-xs accent-text">
                    <Check strokeWidth={2} className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {suggestion.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-ink"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {suggestion.note}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={loveThis}
                  disabled={loved}
                  className="btn btn-primary flex-1"
                >
                  <Heart strokeWidth={1.5} className="h-4 w-4" />
                  {loved ? "Loved" : "Love this look"}
                </button>
                <button
                  type="button"
                  onClick={tryAnother}
                  className="btn btn-outline flex-1"
                >
                  <RefreshCw strokeWidth={1.5} className="h-4 w-4" />
                  Try another
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted">
              Suggestions are inspiration only — never instructions. All style
              decisions remain yours.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-12 text-center">
          <h2 className="text-2xl">Want this every morning?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Join the waitlist and be first in when early access opens.
          </p>
          <div className="mt-6">
            <Link href="/waitlist" className="btn btn-primary">
              Join the waitlist — it&apos;s free
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

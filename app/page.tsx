import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Sun, LineChart } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import GarmentCard from "@/components/GarmentCard";
import Pricing from "@/components/Pricing";
import FeatureVoting from "@/components/FeatureVoting";
import { DEMO_WARDROBE } from "@/lib/constants";

const HOW_IT_WORKS = [
  {
    icon: Camera,
    title: "Photograph your wardrobe once",
    body: "Takes less than 10 minutes. Do it on a quiet Sunday and never again.",
  },
  {
    icon: Sparkles,
    title: "It catalogues everything automatically",
    body: "Every piece, sorted and ready — no spreadsheets, no manual tagging.",
  },
  {
    icon: Sun,
    title: "Get your outfit every morning",
    body: "Your ideal look for today's weather and your agenda, before coffee.",
  },
  {
    icon: LineChart,
    title: "See what you actually wear",
    body: "Track what you reach for, what you never touch, and what it costs you.",
  },
];

const SOCIAL_PROOF = [
  {
    quote: "Finally, an app that uses my actual clothes.",
    attribution: "Early tester, London",
  },
  {
    quote: "I stopped buying things I already own.",
    attribution: "Beta user, New York",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="section pb-12 pt-20 md:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="eyebrow">AI wardrobe assistant</span>
              <h1 className="mt-5 text-4xl leading-[1.1] md:text-6xl">
                Your wardrobe is full. Your mornings shouldn&apos;t be hard.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Visual Closet Tracker photographs your clothes once and suggests
                the perfect outfit every morning — based on the weather and
                what&apos;s on your calendar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/waitlist" className="btn btn-primary">
                  Join the waitlist — it&apos;s free
                </Link>
                <Link href="/demo" className="btn btn-outline">
                  See how it works
                  <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">
                No payment. No login. We never store your photos.
              </p>
            </div>

            {/* Wardrobe preview */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {DEMO_WARDROBE.slice(0, 4).map((item) => (
                <GarmentCard
                  key={item.label}
                  label={item.label}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Problem block */}
        <section className="border-y border-line bg-[#FCFCFC]">
          <div className="section py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl md:text-3xl">
                Not because you have nothing to wear.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Every morning, the same thing. Open the wardrobe. Stare. Close
                it. Put on the same three things again. Not because you have
                nothing to wear — because you can&apos;t{" "}
                <span className="text-ink">see</span> what you have.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 text-3xl md:text-4xl">
              Four steps. Then forget about it.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded border border-line">
                  <step.icon strokeWidth={1.25} className="h-6 w-6 text-ink" />
                </div>
                <p className="mt-5 text-xs font-medium text-muted">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/demo" className="btn btn-outline">
              Try the interactive demo
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Feature voting */}
        <FeatureVoting />

        {/* Social proof */}
        <section className="section border-t border-line">
          <div className="grid gap-6 md:grid-cols-2">
            {SOCIAL_PROOF.map((item) => (
              <figure key={item.attribution} className="card p-8">
                <blockquote className="font-heading text-xl leading-snug text-ink">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted">
                  — {item.attribution}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Placeholder quotes from early testing. Your results may vary —
            suggestions are inspiration only.
          </p>
        </section>

        {/* Pricing */}
        <Pricing />

        {/* Final CTA */}
        <section className="border-t border-line bg-[#FCFCFC]">
          <div className="section py-20 text-center">
            <h2 className="mx-auto max-w-2xl text-3xl md:text-4xl">
              Get dressed in seconds. Starting next season.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Join the waitlist and be first in when early access opens. It&apos;s
              free, and it always will be to start.
            </p>
            <div className="mt-8">
              <Link href="/waitlist" className="btn btn-primary">
                Join the waitlist — it&apos;s free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

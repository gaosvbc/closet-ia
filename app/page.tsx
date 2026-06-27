import Link from "next/link";
import {
  ArrowRight,
  PersonStanding,
  CalendarClock,
  Camera,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import GarmentCard from "@/components/GarmentCard";
import Pricing from "@/components/Pricing";
import FeatureVoting from "@/components/FeatureVoting";
import Comparison from "@/components/Comparison";
import { DEMO_WARDROBE } from "@/lib/constants";

const DIFFERENCE = [
  {
    icon: PersonStanding,
    eyebrow: "Your body",
    body: "We ask for your height, weight, and body type. So every outfit suggestion actually fits — not just looks good on someone else.",
  },
  {
    icon: CalendarClock,
    eyebrow: "Your day",
    body: "Connect your calendar. We read what's ahead — a client meeting, a dinner, a gym session — and dress you accordingly.",
  },
  {
    icon: Camera,
    eyebrow: "Your wardrobe",
    body: "Photograph your clothes once. We catalogue everything. You never think about getting dressed again.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Build your body profile",
    body: "Height, weight, fit preferences. About 2 minutes.",
  },
  {
    title: "Photograph your wardrobe",
    body: "AI catalogues everything automatically. Under 10 minutes.",
  },
  {
    title: "Connect your calendar",
    body: "Optional, but powerful. We dress you for what's ahead.",
  },
  {
    title: "Get dressed every morning",
    body: "Your perfect outfit, fit-checked for your body and planned for your day.",
  },
];

const SOCIAL_PROOF = [
  {
    quote:
      "Finally an app that accounts for the fact I'm 6'3. The suggestions actually make sense.",
    attribution: "Early tester, Berlin",
  },
  {
    quote: "I stopped buying things I already own.",
    attribution: "Beta user, London",
  },
  {
    quote:
      "The calendar feature alone is worth it. I never think about Monday morning anymore.",
    attribution: "Early tester, Barcelona",
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
            <div className="animate-fade-up">
              <span className="eyebrow">AI wardrobe assistant</span>
              <h1 className="mt-5 text-4xl leading-[1.08] md:text-6xl">
                Dressed for your body.
                <br />
                Your day. Your life.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                The AI wardrobe assistant that knows your measurements, your
                calendar, and your clothes — and puts them together every
                morning without you lifting a finger.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="btn btn-primary">
                  Get early access — free
                </Link>
                <Link href="/demo" className="btn btn-ghost">
                  See it in action
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
                  worn={item.worn}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-line bg-[#FBFAF8]">
          <div className="section py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl leading-snug md:text-3xl">
                You have plenty to wear. And yet — nothing feels right.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                You open your wardrobe every morning. You have plenty to wear.
                And yet somehow — nothing feels right. Not because you lack
                clothes. Because no app has ever understood your body, your
                schedule, and your style at the same time.
              </p>
            </div>
          </div>
        </section>

        {/* The difference — 3 columns */}
        <section className="section">
          <div className="grid gap-8 md:grid-cols-3">
            {DIFFERENCE.map((col) => (
              <div key={col.eyebrow} className="panel p-8">
                <col.icon strokeWidth={1} className="h-7 w-7 text-ink" />
                <p className="eyebrow mt-5">{col.eyebrow}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {col.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="section border-t border-line">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 text-3xl md:text-4xl">
              Four steps. Then forget about it.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex flex-col">
                <span className="font-heading text-2xl accent-text">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/onboarding" className="btn btn-ghost">
              Build your profile
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Comparison */}
        <Comparison />

        {/* Feature voting */}
        <FeatureVoting />

        {/* Social proof */}
        <section className="section border-t border-line">
          <div className="grid gap-6 md:grid-cols-3">
            {SOCIAL_PROOF.map((item) => (
              <figure key={item.attribution} className="panel p-8">
                <blockquote className="font-heading text-lg leading-snug text-ink">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted">
                  — {item.attribution}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Placeholder quotes from early testing. Suggestions are inspiration
            only — all style decisions remain yours.
          </p>
        </section>

        {/* Pricing */}
        <Pricing />

        {/* Final CTA */}
        <section className="border-t border-line bg-[#FBFAF8]">
          <div className="section py-20 text-center">
            <h2 className="mx-auto max-w-2xl text-3xl md:text-4xl">
              Dressed for your body. Your day. Your life.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Join early access and be first in when it opens. It&apos;s free to
              start.
            </p>
            <div className="mt-8">
              <Link href="/onboarding" className="btn btn-primary">
                Get early access — free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

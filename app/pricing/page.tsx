import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Visual Closet Tracker",
  description:
    "Three simple plans: Free, Basic, and Pro. Start free and upgrade only when the value is obvious.",
};

const FAQ = [
  {
    q: "Is there really a free plan?",
    a: "Yes. Free lets you catalogue up to 15 items and get 3 outfit suggestions a week — enough to feel the concept. No card required.",
  },
  {
    q: "Can I switch between monthly and annual?",
    a: "Any time. Annual billing saves you 27% on Basic and 30% on Pro versus paying monthly.",
  },
  {
    q: "Am I being charged now?",
    a: "No. This is an early validation phase. Choosing a plan simply registers your interest — no payment is taken.",
  },
  {
    q: "Do you store my photos?",
    a: "No. In this version we never store images. Suggestions are inspiration only; your style decisions remain yours.",
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="section pb-0 text-center">
          <span className="eyebrow">Pricing</span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl md:text-5xl">
            Pay for it only when it earns its place.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Three plans, no hidden fees. Start free, then upgrade for weather,
            calendar styling, and cost-per-wear insights.
          </p>
        </section>

        <Pricing heading={false} />

        <section className="section border-t border-line">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl">Questions, answered</h2>
            <dl className="mt-10 divide-y divide-line">
              {FAQ.map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="text-lg text-ink">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 text-center">
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

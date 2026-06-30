import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Pricing from "@/components/Pricing";
import Comparison from "@/components/Comparison";

export const metadata: Metadata = {
  title: "Pricing — AtelIA",
  description:
    "Two plans: Essential and Pro. Every plan starts with a 7-day free trial — cancel any time and pay nothing.",
};

const FAQ = [
  {
    q: "How does the free trial work?",
    a: "Every plan starts with a 7-day free trial. You get full access from day one, and you can cancel any time during the trial — you won't be charged a cent.",
  },
  {
    q: "What does body-fit intelligence actually do?",
    a: "With your height, weight, body type, and fit preference, suggestions are sized and styled for your frame — not just what looks good on someone else. It's the core of Essential and Pro.",
  },
  {
    q: "Can I switch between monthly and annual?",
    a: "Any time. Annual billing saves you 33% on Essential and 35% on Pro versus paying monthly. Annual is selected by default.",
  },
  {
    q: "Am I being charged now?",
    a: "No. This is an early-access phase. Choosing a plan simply registers your interest — no payment is taken, and no trial starts yet.",
  },
  {
    q: "How is my body data handled?",
    a: "Measurements are only stored if you explicitly opt in, are never shown publicly, never shared, and are protected by row-level security and encryption at rest. You can use the app without providing them.",
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
            Two plans, no hidden fees. Every plan starts with a 7-day free
            trial — full access to fit intelligence, weather, and calendar-aware
            styling. Cancel any time.
          </p>
        </section>

        <Pricing heading={false} />

        <Comparison />

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

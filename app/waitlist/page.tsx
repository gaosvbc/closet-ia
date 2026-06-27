import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist — Visual Closet Tracker",
  description:
    "Join the Visual Closet Tracker waitlist and help shape the app. Free, no payment, no login.",
};

export default function WaitlistPage() {
  return (
    <>
      <SiteNav />
      <main className="section max-w-2xl">
        <div className="text-center">
          <span className="eyebrow">Early access</span>
          <h1 className="mt-4 text-3xl md:text-5xl">Get early access</h1>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Be first in when early access opens. Answer a few quick questions to
            help us build the right thing — every answer is optional. Want the
            full setup?{" "}
            <a href="/onboarding" className="text-ink underline underline-offset-2">
              Build your style profile
            </a>
            .
          </p>
        </div>

        <div className="mt-12">
          <WaitlistForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

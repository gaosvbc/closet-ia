import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Visual Closet Tracker",
  description: "How Visual Closet Tracker handles your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <section>
        <p>
          This is a privacy policy template for the Visual Closet Tracker
          validation phase. It describes how we handle the limited information
          collected through the waitlist, survey, and feature-voting forms.
          Replace this placeholder copy with policy reviewed by qualified
          counsel before going live.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            Your email address and optional first name, when you join the
            waitlist.
          </li>
          <li>
            Optional survey answers about your wardrobe habits (all anonymous,
            all optional).
          </li>
          <li>
            Feature and pricing preferences when you vote, to help prioritise
            what we build.
          </li>
          <li>
            Anonymous interaction events (for example, using the demo) to
            understand what resonates.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we never collect</h2>
        <ul>
          <li>Images of your clothing — no photos are stored in this version.</li>
          <li>Biometric or body measurement data.</li>
          <li>Location data beyond an optional city name.</li>
          <li>Calendar contents — we never access your calendar without explicit permission.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your information solely to validate demand, improve the
          product, and — only if you consent — to email you occasional updates
          about the launch. We do not sell your data.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can unsubscribe from emails at any time. To request deletion of
          your data, contact us using the details you&apos;ll add here before
          launch.
        </p>
      </section>
    </LegalLayout>
  );
}

import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Disclaimer — AtelIA",
  description: "Important notes about AtelIA's suggestions.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" updated="June 2026">
      <section>
        <p>
          AtelIA provides outfit suggestions for inspiration
          only. All style decisions remain yours.
        </p>
      </section>

      <section>
        <h2>What this product does not do</h2>
        <ul>
          <li>It does not guarantee outfit accuracy or appropriateness.</li>
          <li>
            It does not access your calendar without your explicit permission.
          </li>
          <li>It does not store images permanently in this version.</li>
          <li>
            It provides style suggestions as inspiration only, never as
            instructions.
          </li>
        </ul>
      </section>

      <section>
        <h2>Validation phase</h2>
        <p>
          This site is an early validation experience. The interactive demo is a
          simulation and does not use real AI, real weather data, or your real
          wardrobe. Pricing shown registers interest only — no payment is taken.
        </p>
      </section>
    </LegalLayout>
  );
}

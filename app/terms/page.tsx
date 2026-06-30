import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — AtelIA",
  description: "The terms governing your use of AtelIA.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <section>
        <p>
          These terms are a template for the AtelIA validation
          phase. Replace this placeholder copy with terms reviewed by qualified
          counsel before going live.
        </p>
      </section>

      <section>
        <h2>The service</h2>
        <p>
          AtelIA is an early-stage product being validated with a
          waitlist and an interactive demo. Features described on this site are
          planned and may change. No paid service is currently offered.
        </p>
      </section>

      <section>
        <h2>Suggestions are inspiration only</h2>
        <p>
          Any outfit suggestion provided by the demo or the future product is
          inspiration only and never an instruction. All style decisions remain
          yours. We do not guarantee outfit accuracy or suitability for any
          occasion.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not submit false or other people&apos;s personal information.</li>
          <li>Do not attempt to disrupt, probe, or overload the service.</li>
          <li>Do not misuse the forms to send unsolicited or automated content.</li>
        </ul>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The site is provided &quot;as is&quot; during this validation phase,
          without warranties of any kind. To the maximum extent permitted by
          law, we are not liable for any decisions made based on suggestions
          shown here.
        </p>
      </section>
    </LegalLayout>
  );
}

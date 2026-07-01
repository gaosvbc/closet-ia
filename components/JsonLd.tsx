/**
 * Renders a JSON-LD <script> tag for structured data (schema.org).
 * Usage: <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", ... }} />
 *
 * Why a component instead of inlining <script> everywhere: keeps the
 * JSON.stringify + dangerouslySetInnerHTML boilerplate (and the XSS-safe
 * escaping of "</script>") in exactly one place.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

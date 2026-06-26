import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// Shared shell for the long-form legal pages. Keeps typography consistent and
// readable with generous white space.

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="section max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-4 text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <div className="legal-prose mt-12 space-y-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

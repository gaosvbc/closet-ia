import Link from "next/link";

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-content px-6 py-16 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-heading text-lg text-ink">Visual Closet Tracker</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Dressed for your body. Your day. Your life. The AI wardrobe
              assistant that knows your measurements, your calendar, and your
              clothes.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <span className="eyebrow">Product</span>
            <Link href="/demo" className="text-sm text-muted hover:text-ink">
              Demo
            </Link>
            <Link href="/onboarding" className="text-sm text-muted hover:text-ink">
              Get early access
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-ink">
              Pricing
            </Link>
          </nav>

          <nav className="flex flex-col gap-3">
            <span className="eyebrow">Legal</span>
            {legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="max-w-2xl text-xs leading-relaxed text-muted">
            Visual Closet Tracker provides outfit suggestions for inspiration and
            personal guidance only. All style decisions remain entirely yours.
          </p>
          <p className="mt-4 text-xs text-muted">
            © {new Date().getFullYear()} Visual Closet Tracker. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

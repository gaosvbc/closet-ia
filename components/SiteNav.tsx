import Link from "next/link";

const links = [
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg tracking-tight text-ink"
          aria-label="Visual Closet Tracker home"
        >
          Visual Closet Tracker
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link href="/waitlist" className="btn btn-primary px-5 py-2.5 text-sm">
          Join the waitlist
        </Link>
      </nav>
    </header>
  );
}

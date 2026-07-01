import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "AtelIA — Your AI Personal Stylist",
  description:
    "The AI wardrobe assistant that knows your measurements, your calendar, and your clothes — and puts them together every morning without you lifting a finger.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AtelIA — Your AI Personal Stylist",
    description: "Your AI Personal Stylist",
    type: "website",
    url: BASE_URL,
    siteName: "AtelIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "AtelIA — Your AI Personal Stylist",
    description: "Your AI Personal Stylist",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-background font-body text-ink antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "AtelIA",
            url: BASE_URL,
            description:
              "The AI wardrobe assistant that knows your measurements, your calendar, and your clothes.",
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AtelIA",
            url: BASE_URL,
          }}
        />
        {children}
      </body>
    </html>
  );
}

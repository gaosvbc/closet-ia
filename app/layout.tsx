import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visual Closet Tracker — Your wardrobe, finally organised",
  description:
    "Visual Closet Tracker photographs your clothes once and suggests the perfect outfit every morning — based on the weather and what's on your calendar.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Visual Closet Tracker",
    description:
      "Photograph your wardrobe once. Get the perfect outfit every morning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}

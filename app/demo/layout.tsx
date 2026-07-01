import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try the demo — AtelIA",
  description:
    "See AtelIA suggest a full outfit from a sample wardrobe in seconds — no signup, no real AI calls, just the experience.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

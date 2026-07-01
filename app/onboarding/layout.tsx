import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your profile — AtelIA",
  description: "Tell AtelIA your body, fit preferences, and wardrobe challenges so it can start dressing you.",
  robots: { index: false, follow: true },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

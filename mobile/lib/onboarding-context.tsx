import { createContext, useContext, useMemo, useState } from "react";

// Collects every onboarding answer as the user progresses through the 10
// screens. Persisted to AsyncStorage on the final screen. Kept in React context
// so each screen can read/update without prop drilling.

export type ClothingType = "feminine" | "masculine";
export type Gender = "male" | "female" | "prefer_not";

export interface OnboardingData {
  clothingType: ClothingType[];
  gender: Gender | null;
  height: number;
  heightUnit: "cm" | "ft";
  weight: number;
  weightUnit: "kg" | "lbs";
  occupation: string;
  facePhoto: string | null;
  bodyPhoto: string | null;
  bodyType: string;
  brands: string[];
  source: string;
}

const DEFAULT_DATA: OnboardingData = {
  clothingType: [],
  gender: null,
  height: 172,
  heightUnit: "cm",
  weight: 68,
  weightUnit: "kg",
  occupation: "",
  facePhoto: null,
  bodyPhoto: null,
  bodyType: "medium",
  brands: [],
  source: "",
};

interface OnboardingContextValue {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      data,
      update: (patch) => setData((prev) => ({ ...prev, ...patch })),
      reset: () => setData(DEFAULT_DATA),
    }),
    [data]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}

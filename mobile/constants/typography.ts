// Font family names match the exports from @expo-google-fonts/* and are loaded
// in app/_layout.tsx via useFonts. Use these constants everywhere instead of
// hardcoding strings so a font rename is a single edit.
export const fonts = {
  display: "CormorantGaramond_500Medium",
  displayItalic: "CormorantGaramond_500Medium_Italic",
  displaySemibold: "CormorantGaramond_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
} as const;

// Shared eyebrow style (uppercase small label) reused across screens.
export const eyebrow = {
  fontFamily: fonts.bodyMedium,
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
};

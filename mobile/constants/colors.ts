// Official Visual Closet Tracker palette.
//
// Color hierarchy:
//   70%  bg / surface           — backgrounds and surfaces
//   20%  textPrimary / greys    — text, icons, borders
//    8%  accent (#8B1524)       — primary CTAs, active tab, camera button,
//                                 heart favorites, active category pill, dates
//    2%  gold (#C8A45D)         — accessories only
export const colors = {
  bg: "#FBFAF7",
  surface: "#F7F4EF",
  border: "#E8E2DC",
  textPrimary: "#171717",
  textSecondary: "#8C8580",
  accent: "#8B1524",
  accentDark: "#5A1118",
  accentTint: "#FDF0F1", // light wine wash used on badges
  accentTintCard: "#FDF5F6", // light wine tint for selected cards
  white: "#FFFFFF",
  beige: "#D8C9B8",
  denim: "#6F8798",
  gold: "#C8A45D",
  ink: "#1A1A1A",
  black: "#0A0A0A",
  cameraBg: "#1A1A1A",
} as const;

export type ColorName = keyof typeof colors;

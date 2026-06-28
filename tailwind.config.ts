import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Visual Closet Tracker palette
        background: "#FBFAF7", // warm white (not pure white)
        surface: "#F7F4EF", // ivory surface for cards/inputs
        ink: "#171717", // primary text
        muted: "#8C8580", // secondary text
        line: "#E8E2DC", // borders / dividers
        accent: "#8B1524", // wine red — CTAs / active / focus only
        "accent-dark": "#5A1118", // hover / pressed
        beige: "#D8C9B8",
        denim: "#6F8798",
        gold: "#C8A45D", // accessory category indicators only
        success: "#2D6A4F",
        error: "#C1121F",
      },
      fontFamily: {
        heading: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        sm: "8px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        card: "12px",
        input: "8px",
        image: "8px",
        pill: "50px",
        full: "9999px",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

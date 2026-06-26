import { Shirt, Footprints, type LucideIcon } from "lucide-react";

// Pure-CSS placeholder card for a garment. No images are stored or loaded in
// v1 — these are abstract, tasteful swatches that work for both feminine and
// masculine garment types.

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Tops: Shirt,
  Outerwear: Shirt,
  Bottoms: Shirt,
  Shoes: Footprints,
};

// Neutral, gender-free swatch tones — no pink, no bright colours.
const SWATCH: Record<string, string> = {
  "White Shirt": "#FAFAFA",
  "Navy Blazer": "#2A3142",
  "Black Trousers": "#1A1A1A",
  "Silk Blouse": "#ECE7DF",
  "Grey Coat": "#9B9B9B",
  "White Sneakers": "#F4F4F4",
  "Camel Trench": "#C9A96E",
  "Blue Denim": "#3E5C76",
};

export default function GarmentCard({
  label,
  category,
  selected = false,
}: {
  label: string;
  category: string;
  selected?: boolean;
}) {
  const Icon = CATEGORY_ICON[category] ?? Shirt;
  const swatch = SWATCH[label] ?? "#EDEDED";
  const lightSwatch = isLight(swatch);

  return (
    <div
      className={`card overflow-hidden transition-colors ${
        selected ? "border-ink" : "border-line"
      }`}
    >
      <div
        className="flex aspect-square items-center justify-center"
        style={{ backgroundColor: swatch }}
      >
        <Icon
          strokeWidth={1}
          className="h-10 w-10"
          style={{ color: lightSwatch ? "#111111" : "#FFFFFF", opacity: 0.55 }}
          aria-hidden
        />
      </div>
      <div className="border-t border-line px-3 py-3">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{category}</p>
      </div>
    </div>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
}

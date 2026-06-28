import { Shirt, Footprints, type LucideIcon } from "lucide-react";

// Pure-CSS placeholder card for a garment. No images are stored or loaded in
// v1 — these are abstract, tasteful swatches that work for both feminine and
// masculine garment types. Optionally shows a "worn X times" counter.

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Tops: Shirt,
  Outerwear: Shirt,
  Bottoms: Shirt,
  Shoes: Footprints,
};

// Neutral, gender-free swatch tones — no pink, no blue coding, no bright colour.
const SWATCH: Record<string, string> = {
  "White Oxford Shirt": "#FAFAFA",
  "Navy Blazer": "#222A38",
  "Black Tailored Trousers": "#141414",
  "Silk Blouse": "#ECE7DF",
  "Camel Trench": "#C4A882",
  "White Sneakers": "#F4F4F4",
  "Grey Wool Coat": "#9B9B9B",
  "Dark Denim": "#34465A",
  "Black Chelsea Boots": "#1A1A1A",
};

export default function GarmentCard({
  label,
  category,
  worn,
  selected = false,
}: {
  label: string;
  category: string;
  worn?: number;
  selected?: boolean;
}) {
  const Icon = CATEGORY_ICON[category] ?? Shirt;
  const swatch = SWATCH[label] ?? "#EDEDED";
  const lightSwatch = isLight(swatch);

  return (
    <div
      className={`panel overflow-hidden transition-colors ${
        selected ? "border-ink" : "border-line"
      }`}
    >
      <div
        className="flex aspect-square items-center justify-center"
        style={{ backgroundColor: swatch }}
      >
        <Icon
          strokeWidth={1}
          className="h-9 w-9"
          style={{ color: lightSwatch ? "#0A0A0A" : "#FFFFFF", opacity: 0.5 }}
          aria-hidden
        />
      </div>
      <div className="border-t border-line px-3 py-3">
        <p className="text-[13px] font-medium leading-tight text-ink">{label}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted">{category}</span>
          {typeof worn === "number" && (
            <span className="text-xs text-muted">worn {worn}×</span>
          )}
        </div>
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

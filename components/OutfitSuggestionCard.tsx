import { Check } from "lucide-react";

// Presentational outfit suggestion card with body-fit notes. Used in the demo
// and reusable anywhere a suggestion needs to be shown. Action buttons are
// passed in via `actions` so the card stays presentation-only.

export interface OutfitSuggestion {
  items: string[];
  note: string;
  fitNote: string;
  repeatNote: string;
}

export default function OutfitSuggestionCard({
  suggestion,
  saved = false,
  actions,
}: {
  suggestion: OutfitSuggestion;
  saved?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="panel border-l-[3px] border-l-accent bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Today&apos;s suggestion</span>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs accent-text">
            <Check strokeWidth={2} className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {suggestion.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        {suggestion.note}
      </p>

      {/* Fit + repeat badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge>{suggestion.fitNote}</Badge>
        <Badge>{suggestion.repeatNote}</Badge>
      </div>

      {actions && <div className="mt-6">{actions}</div>}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1 text-xs text-ink">
      <Check strokeWidth={2} className="h-3 w-3 text-accent" aria-hidden />
      {children}
    </span>
  );
}

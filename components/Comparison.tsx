import { Check, Minus } from "lucide-react";
import { COMPARISON } from "@/lib/constants";

// Us vs. competitors. Uses thin Lucide icons rather than emoji ticks/crosses,
// per the design system. The first column (our product) is visually anchored.

export default function Comparison() {
  const { competitors, rows } = COMPARISON;

  return (
    <section className="section border-t border-line">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">The difference</span>
        <h2 className="mt-4 text-3xl md:text-4xl">
          Built to do what others don&apos;t.
        </h2>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-4 text-left font-normal text-muted" />
              {competitors.map((name, i) => (
                <th
                  key={name}
                  className={`px-4 py-4 text-center align-bottom ${
                    i === 0
                      ? "font-heading text-base text-ink"
                      : "text-sm font-normal text-muted"
                  }`}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line">
                <td className="py-4 pr-4 text-ink">{row.label}</td>
                {row.values.map((val, i) => (
                  <td
                    key={i}
                    className={`px-4 py-4 text-center ${
                      i === 0 ? "bg-surface" : ""
                    }`}
                  >
                    {val ? (
                      <Check
                        strokeWidth={1.5}
                        className="mx-auto h-4 w-4 text-accent"
                        aria-label="Yes"
                      />
                    ) : (
                      <Minus
                        strokeWidth={1.5}
                        className="mx-auto h-4 w-4 text-muted"
                        aria-label="No"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

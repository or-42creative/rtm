export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

const PALETTE = [
  "var(--c-purple)",
  "var(--c-blue)",
  "var(--c-teal)",
  "var(--c-lime)",
  "var(--c-orange)",
  "var(--c-pink)",
];

/** A playful animated vertical bar chart (no external chart lib). */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end justify-between gap-2 pt-6">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div
            key={d.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-sm font-black">{d.value}</span>
            <div
              className="w-full max-w-12 rounded-t-xl shadow-sm"
              style={{
                height: `${Math.max(pct, d.value > 0 ? 6 : 2)}%`,
                background: d.highlight
                  ? "var(--color-accent)"
                  : PALETTE[i % PALETTE.length],
                transformOrigin: "bottom",
                animation: "growBar 0.6s cubic-bezier(0.21,1.02,0.73,1) both",
                animationDelay: `${i * 70}ms`,
              }}
            />
            <span className="text-xs font-bold text-[var(--color-ink-soft)]">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

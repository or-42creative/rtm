import { cn } from "./ui";
import type { BarDatum } from "@/lib/scores";

const PALETTE = [
  "var(--c-purple)",
  "var(--c-blue)",
  "var(--c-teal)",
  "var(--c-lime)",
  "var(--c-orange)",
  "var(--c-pink)",
];

/** Playful animated bar chart (no chart lib). Handles few bars (months) or
 *  many (days of the month) — dense mode drops per-bar numbers. */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const dense = data.length > 12;
  return (
    <div className={cn("flex h-48 items-end justify-between pt-6", dense ? "gap-px" : "gap-2")}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          title={d.title}
        >
          {!dense && <span className="text-sm font-black">{d.value}</span>}
          <div
            className={cn("w-full rounded-t-lg shadow-sm", !dense && "max-w-12")}
            style={{
              height: `${Math.max((d.value / max) * 100, d.value > 0 ? 6 : 2)}%`,
              background: d.highlight
                ? "var(--color-accent)"
                : PALETTE[i % PALETTE.length],
              transformOrigin: "bottom",
              animation: "growBar 0.5s cubic-bezier(0.21,1.02,0.73,1) both",
              animationDelay: `${Math.min(i, 31) * 25}ms`,
            }}
          />
          <span className="h-3 text-[10px] font-bold leading-none text-[var(--color-ink-soft)]">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

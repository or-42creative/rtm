import { cn } from "./ui";

/**
 * Brand wordmark: "Rבעים ושתיים TM".
 * A bilingual pun — "ארבעים ושתיים" (42) with the R and TM picked out so it
 * also spells RTM. Rendered dir="rtl" so the Hebrew/Latin mix stays in order
 * (R on the right, TM on the left). The accent spans carry no dir, so they
 * don't disturb the bidi ordering.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="rtl" className={cn("font-black tracking-tight", className)}>
      <span className="text-[var(--color-accent)]">R</span>בעים ושתיים{" "}
      <span className="text-[var(--color-accent)]">TM</span>
    </span>
  );
}

/** 42 mark + wordmark. Placeholder square mark — swap for the official logo
 *  asset when it lands in the project. */
export function Logo({
  size = 36,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid shrink-0 place-items-center rounded-xl bg-[var(--color-ink)] font-black text-white"
        style={{ width: size, height: size, fontSize: size * 0.46 }}
      >
        42
        <span
          className="absolute rounded-full bg-[var(--color-accent)]"
          style={{
            width: size * 0.16,
            height: size * 0.16,
            insetInlineEnd: size * 0.12,
            insetBlockEnd: size * 0.12,
          }}
        />
      </div>
      {withWordmark && <Wordmark className="text-lg" />}
    </div>
  );
}

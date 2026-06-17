import { cn } from "./ui";

/**
 * Brand wordmark: "RTM ושתיים" (a play on ארבעים ושתיים = 42).
 * dir="rtl" keeps the Latin/Hebrew mix in order — RTM on the right, ושתיים to
 * its left. "RTM" is picked out in the accent (neon-pink) to match the logo.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="rtl" className={cn("font-black tracking-tight", className)}>
      <span className="text-[var(--color-accent)]">RTM</span> ושתיים
    </span>
  );
}

/** The neon mark (cropped from the logo) + wordmark. */
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
      <img
        src="/mark.png"
        alt="RTM ושתיים"
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-cover"
      />
      {withWordmark && <Wordmark className="text-lg" />}
    </div>
  );
}

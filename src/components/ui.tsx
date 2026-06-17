import type { ButtonHTMLAttributes, ReactNode } from "react";

export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

type Variant = "primary" | "outline" | "ghost" | "danger" | "gold";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-ink)] text-white hover:bg-black focus-visible:ring-[var(--color-ink)]",
  outline:
    "bg-white text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-ink)] focus-visible:ring-[var(--color-ink)]",
  ghost:
    "bg-transparent text-[var(--color-ink-soft)] hover:bg-[var(--color-cloud)] focus-visible:ring-[var(--color-line)]",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:ring-red-300",
  gold: "bg-[var(--color-gold)] text-[var(--color-ink)] hover:brightness-95 focus-visible:ring-[var(--color-gold)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        block && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-6 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-ink)]",
        className,
      )}
      role="status"
      aria-label="טוען"
    />
  );
}

export function FullScreen({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6">{children}</div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "gold" | "green";
}) {
  const tones = {
    neutral: "bg-[var(--color-cloud)] text-[var(--color-ink-soft)]",
    accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    gold: "bg-[var(--color-gold)]/20 text-[#9a7b00]",
    green: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 36,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="grid place-items-center rounded-full bg-[var(--color-ink)] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-12 text-center">
      <p className="font-bold text-[var(--color-ink)]">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-ink-soft)]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-ink)]/10 disabled:bg-[var(--color-cloud)]";

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-bold">
        {label}
        {required && <span className="text-[var(--color-accent)]">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-ink-soft)]">{hint}</span>}
    </label>
  );
}

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-black">{children}</h2>
      {hint && <span className="text-sm text-[var(--color-ink-soft)]">{hint}</span>}
    </div>
  );
}

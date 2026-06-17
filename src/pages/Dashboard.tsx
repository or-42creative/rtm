import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import {
  computeMonthScores,
  currentMonthKey,
  lastMonths,
  monthLabel,
  prevMonthKey,
  shortMonthLabel,
} from "@/lib/scores";
import type { ScoreRow } from "@/types";
import { Avatar, Badge, Button, Card, EmptyState, SectionTitle, Spinner } from "@/components/ui";
import { CountUp } from "@/components/CountUp";
import { BarChart } from "@/components/BarChart";
import { Collage } from "@/components/Collage";

const countLikes = (reactions?: Record<string, boolean>) =>
  reactions ? Object.keys(reactions).length : 0;

export function DashboardPage() {
  const { rtms, employees, clients, loading } = useAppData();
  const [monthKey, setMonthKey] = useState(currentMonthKey());

  const scores = useMemo(
    () => computeMonthScores(rtms, monthKey, employees, clients),
    [rtms, monthKey, employees, clients],
  );
  const prev = useMemo(
    () => computeMonthScores(rtms, prevMonthKey(monthKey), employees, clients),
    [rtms, monthKey, employees, clients],
  );

  const monthRtms = useMemo(
    () => rtms.filter((r) => r.monthKey === monthKey),
    [rtms, monthKey],
  );

  const totalLikes = useMemo(
    () => monthRtms.reduce((sum, r) => sum + countLikes(r.reactions), 0),
    [monthRtms],
  );

  const trend = useMemo(() => {
    const keys = lastMonths(monthKey, 6);
    const counts = new Map<string, number>();
    for (const r of rtms) counts.set(r.monthKey, (counts.get(r.monthKey) ?? 0) + 1);
    return keys.map((k, i) => ({
      label: shortMonthLabel(k),
      value: counts.get(k) ?? 0,
      highlight: i === keys.length - 1,
    }));
  }, [rtms, monthKey]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const isCurrent = monthKey === currentMonthKey();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="animate-fade-up">
          <p className="text-sm font-black text-[var(--color-accent)]">דאשבורד · תחרות ה‑RTM</p>
          <h1 className="text-4xl font-black tracking-tight">{monthLabel(monthKey)}</h1>
        </div>
        <MonthNav monthKey={monthKey} onChange={setMonthKey} canGoNext={!isCurrent} />
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          emoji="🚀"
          label={isCurrent ? "RTMים החודש" : "RTMים בחודש"}
          value={scores.rtmCount}
          theme="ink"
        />
        <StatCard emoji="❤️" label="לייקים שנאספו" value={totalLikes} theme="pink" />
        <Card className="flex flex-col justify-center">
          <p className="text-sm font-bold text-[var(--color-ink-soft)]">🏅 הלקוח המוביל</p>
          <p className="mt-1 truncate text-2xl font-black">
            {scores.topClient ? scores.topClient.name : "—"}
          </p>
          {scores.topClient && <Badge tone="accent">{scores.topClient.count} RTM</Badge>}
        </Card>
      </div>

      {/* The collage — the wall of RTMs */}
      <section>
        <SectionTitle hint={`${monthRtms.length} פוסטים`}>🎬 הקיר של ה‑RTMים</SectionTitle>
        {monthRtms.length === 0 ? (
          <EmptyState
            title="הקיר עוד ריק 🎨"
            hint="ברגע שיעלו RTMים החודש הם יופיעו כאן בקולאז׳ צבעוני. רוצים להיות הראשונים?"
            action={
              <Link to="/submit">
                <Button>להעלות RTM</Button>
              </Link>
            }
          />
        ) : (
          <Collage rtms={monthRtms} />
        )}
      </section>

      {/* Trend chart */}
      <Card>
        <SectionTitle hint="6 חודשים אחרונים">📈 קצב ה‑RTMים</SectionTitle>
        <BarChart data={trend} />
      </Card>

      {/* Last month winners */}
      <section>
        <SectionTitle>🏆 הזוכים של {monthLabel(prevMonthKey(monthKey))}</SectionTitle>
        {prev.rtmCount === 0 ? (
          <EmptyState title="אין עדיין זוכים לחודש הקודם" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <WinnerCard title="מלך/ת הרעיונות 👑" subtitle="הכי הרבה נקודות רעיון" row={prev.winners.topIdea} />
            <WinnerCard title="מנהל/ת הלקוח של החודש ⭐" subtitle="הכי הרבה RTM ללקוחות" row={prev.winners.topAccountManager} />
          </div>
        )}
      </section>

      {/* Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard title="💡 מביאי הרעיונות" unit="נק׳" rows={scores.ideaScores} />
        <Leaderboard title="🎯 מנהלי לקוח מובילים" unit="RTM" rows={scores.amScores} />
      </div>
    </div>
  );
}

function MonthNav({
  monthKey,
  onChange,
  canGoNext,
}: {
  monthKey: string;
  onChange: (key: string) => void;
  canGoNext: boolean;
}) {
  const next = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white p-1 shadow-sm">
      <button
        className="rounded-full px-3 py-1.5 text-sm font-bold hover:bg-[var(--color-cloud)]"
        onClick={() => onChange(prevMonthKey(monthKey))}
        aria-label="חודש קודם"
      >
        →
      </button>
      <span className="min-w-28 text-center text-sm font-black">{monthLabel(monthKey)}</span>
      <button
        className="rounded-full px-3 py-1.5 text-sm font-bold enabled:hover:bg-[var(--color-cloud)] disabled:opacity-30"
        disabled={!canGoNext}
        onClick={() => onChange(next(monthKey))}
        aria-label="חודש הבא"
      >
        ←
      </button>
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
  theme,
}: {
  emoji: string;
  label: string;
  value: number;
  theme: "ink" | "pink";
}) {
  const bg =
    theme === "ink"
      ? "bg-[var(--color-ink)] text-white"
      : "bg-gradient-to-br from-[var(--c-pink)] to-[var(--c-purple)] text-white";
  return (
    <Card className={`relative overflow-hidden ${bg}`}>
      <span className="absolute -bottom-4 -start-2 text-7xl opacity-15">{emoji}</span>
      <p className="text-sm font-bold text-white/75">{label}</p>
      <p className="mt-1 text-5xl font-black">
        <CountUp value={value} />
      </p>
    </Card>
  );
}

function WinnerCard({
  title,
  subtitle,
  row,
}: {
  title: string;
  subtitle: string;
  row: ScoreRow | null;
}) {
  return (
    <Card className="flex items-center gap-4 border-[var(--color-gold)]/50 bg-gradient-to-l from-[var(--color-gold)]/15 to-transparent">
      <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--color-gold)] text-3xl animate-float">
        🏆
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-[#9a7b00]">{title}</p>
        <p className="truncate text-xl font-black">{row ? row.name : "—"}</p>
        <p className="text-xs text-[var(--color-ink-soft)]">
          {row ? `${row.count} · ${subtitle}` : subtitle}
        </p>
      </div>
    </Card>
  );
}

function Leaderboard({
  title,
  unit,
  rows,
}: {
  title: string;
  unit: string;
  rows: ScoreRow[];
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-ink-soft)]">
          אין עדיין נתונים לחודש הזה.
        </p>
      ) : (
        <ol className="space-y-1">
          {rows.map((r, i) => (
            <li
              key={r.employeeId}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[var(--color-cloud)]"
            >
              <span className="w-6 text-center text-lg font-black">
                {medals[i] ?? (
                  <span className="text-sm text-[var(--color-ink-soft)]">{i + 1}</span>
                )}
              </span>
              <Avatar name={r.name} size={30} />
              <span className="me-auto font-bold">{r.name}</span>
              <span className="font-black">
                {r.count}{" "}
                <span className="text-xs font-bold text-[var(--color-ink-soft)]">{unit}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

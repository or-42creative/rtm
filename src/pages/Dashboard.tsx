import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import {
  computeMonthScores,
  currentMonthKey,
  dailyCounts,
  lastMonths,
  monthLabel,
  prevMonthKey,
  shortMonthLabel,
} from "@/lib/scores";
import type { Rtm, ScoreRow } from "@/types";
import { Avatar, Badge, Button, Card, EmptyState, SectionTitle, Spinner } from "@/components/ui";
import { BarChart } from "@/components/BarChart";
import { Collage } from "@/components/Collage";

const countLikes = (reactions?: Record<string, boolean>) =>
  reactions ? Object.keys(reactions).length : 0;

export function DashboardPage() {
  const { rtms, employees, clients, settings, t, loading } = useAppData();
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
    () => rtms.filter((r) => r.monthKey === monthKey && r.status !== "disqualified"),
    [rtms, monthKey],
  );
  const totalLikes = useMemo(
    () => monthRtms.reduce((s, r) => s + countLikes(r.reactions), 0),
    [monthRtms],
  );
  const loved = useMemo(
    () =>
      monthRtms
        .filter((r) => countLikes(r.reactions) > 0)
        .sort((a, b) => countLikes(b.reactions) - countLikes(a.reactions))
        .slice(0, 5),
    [monthRtms],
  );

  const daily = useMemo(() => dailyCounts(rtms, monthKey), [rtms, monthKey]);
  const months = useMemo(() => {
    const keys = lastMonths(monthKey, 6);
    const counts = new Map<string, number>();
    for (const r of rtms) {
      if (r.status === "disqualified") continue;
      counts.set(r.monthKey, (counts.get(r.monthKey) ?? 0) + 1);
    }
    return keys.map((k, i) => ({
      label: shortMonthLabel(k),
      value: counts.get(k) ?? 0,
      highlight: i === keys.length - 1,
      title: `${monthLabel(k)} · ${counts.get(k) ?? 0} RTM`,
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
  const prize = settings.content.monthlyPrize.trim();
  const announcement = settings.content.announcement.trim();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="animate-fade-up">
          <p className="text-sm font-black text-[var(--color-accent)]">{t("dash.kicker")}</p>
          <h1 className="text-4xl font-black tracking-tight">{monthLabel(monthKey)}</h1>
        </div>
        <MonthNav monthKey={monthKey} onChange={setMonthKey} canGoNext={!isCurrent} />
      </div>

      {announcement && (
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-ink)] px-5 py-3 font-bold text-white animate-fade-up">
          <span className="text-lg">📢</span>
          <span>{announcement}</span>
        </div>
      )}

      {/* Prize + top client */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-4 border-[var(--color-gold)]/50 bg-gradient-to-l from-[var(--color-gold)]/15 to-transparent">
          <span className="text-4xl animate-float">🎁</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#9a7b00]">{t("dash.prizeLabel")}</p>
            <p className="text-lg font-black">{prize || t("dash.prizeEmpty")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="text-4xl">🏅</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-[var(--color-ink-soft)]">{t("dash.topClient")}</p>
            <p className="truncate text-lg font-black">{scores.topClient ? scores.topClient.name : "—"}</p>
            {scores.topClient && <Badge tone="accent">{scores.topClient.count} RTM</Badge>}
          </div>
        </Card>
      </div>

      {/* Current standings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard title={t("dash.ideaBoard")} unit="נק׳" rows={scores.ideaScores} empty={t("dash.boardEmpty")} />
        <Leaderboard title={t("dash.amBoard")} unit="RTM" rows={scores.amScores} empty={t("dash.boardEmpty")} />
      </div>

      {/* Collage */}
      <section>
        <SectionTitle hint={`${monthRtms.length} פוסטים`}>{t("dash.collage")}</SectionTitle>
        {monthRtms.length === 0 ? (
          <EmptyState
            title={t("dash.collageEmptyTitle")}
            hint={t("dash.collageEmptyHint")}
            action={
              <Link to="/submit">
                <Button>{t("dash.collageCta")}</Button>
              </Link>
            }
          />
        ) : (
          <Collage rtms={monthRtms} cols={settings.collageCols} rows={settings.collageRows} />
        )}
      </section>

      {/* Pace by day */}
      <Card>
        <SectionTitle hint={`${scores.rtmCount} החודש`}>{t("dash.pace")}</SectionTitle>
        <BarChart data={daily} />
      </Card>

      {/* Likes + previous months */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle hint={`${totalLikes} לייקים`}>{t("dash.loved")}</SectionTitle>
          {loved.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-ink-soft)]">{t("dash.lovedEmpty")}</p>
          ) : (
            <ol className="space-y-1">
              {loved.map((r, i) => (
                <LovedRow key={r.id} rtm={r} rank={i} />
              ))}
            </ol>
          )}
        </Card>
        <Card>
          <SectionTitle>{t("dash.prevMonths")}</SectionTitle>
          <BarChart data={months} />
        </Card>
      </div>

      {/* Winners (bottom) */}
      <section>
        <SectionTitle>{t("dash.winnersTitle", { month: monthLabel(prevMonthKey(monthKey)) })}</SectionTitle>
        {prev.rtmCount === 0 ? (
          <EmptyState title={t("dash.winnersEmpty")} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <WinnerCard title={t("dash.winnerIdea")} subtitle={t("dash.winnerIdeaSub")} row={prev.winners.topIdea} />
            <WinnerCard title={t("dash.winnerAm")} subtitle={t("dash.winnerAmSub")} row={prev.winners.topAccountManager} />
          </div>
        )}
      </section>
    </div>
  );
}

function LovedRow({ rtm, rank }: { rtm: Rtm; rank: number }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[var(--color-cloud)]">
      <span className="w-6 text-center text-lg font-black">
        {medals[rank] ?? <span className="text-sm text-[var(--color-ink-soft)]">{rank + 1}</span>}
      </span>
      <span className="me-auto min-w-0">
        <span className="block truncate font-bold">{rtm.name}</span>
        <span className="block truncate text-xs text-[var(--color-ink-soft)]">{rtm.clientName}</span>
      </span>
      <span className="shrink-0 font-black text-[var(--c-pink)]">
        ❤️ {countLikes(rtm.reactions)}
      </span>
    </li>
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
  empty,
}: {
  title: string;
  unit: string;
  rows: ScoreRow[];
  empty: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-ink-soft)]">{empty}</p>
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

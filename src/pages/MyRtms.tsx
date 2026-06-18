import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { currentMonthKey, monthLabel } from "@/lib/scores";
import type { Rtm } from "@/types";
import { Button, Card, EmptyState, SectionTitle } from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";

export function MyRtmsPage() {
  const { appUser } = useAuth();
  const { rtms, clients, t } = useAppData();
  const myId = appUser?.employeeId ?? "";

  const { mine, byMonth, thisMonthCount, amThisMonth, isAM } = useMemo(() => {
    const mine = rtms.filter((r) => r.ideaOwnerIds.includes(myId));
    const byMonth = new Map<string, Rtm[]>();
    for (const r of mine) {
      const list = byMonth.get(r.monthKey) ?? [];
      list.push(r);
      byMonth.set(r.monthKey, list);
    }
    const cm = currentMonthKey();
    const isAM = clients.some((c) => c.accountManagerId === myId);
    const amThisMonth = rtms.filter(
      (r) => r.accountManagerId === myId && r.monthKey === cm,
    ).length;
    return {
      mine,
      byMonth: [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])),
      thisMonthCount: byMonth.get(cm)?.length ?? 0,
      amThisMonth,
      isAM,
    };
  }, [rtms, clients, myId]);

  return (
    <div>
      <h1 className="text-2xl font-black">{t("my.title")}</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label={`${t("my.statMonth")} (${monthLabel(currentMonthKey())})`} value={thisMonthCount} />
        <Stat label={t("my.statTotal")} value={mine.length} />
        {isAM && <Stat label={t("my.statAm")} value={amThisMonth} tone="gold" />}
      </div>

      <div className="mt-8">
        {byMonth.length === 0 ? (
          <EmptyState
            title={t("my.emptyTitle")}
            hint={t("my.emptyHint")}
            action={
              <Link to="/submit">
                <Button>{t("my.emptyCta")}</Button>
              </Link>
            }
          />
        ) : (
          byMonth.map(([key, list]) => (
            <section key={key} className="mb-8">
              <SectionTitle hint={`${list.length} RTM`}>{monthLabel(key)}</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => (
                  <RtmCard
                    key={r.id}
                    rtm={r}
                    editHref={r.createdByUid === appUser?.uid ? `/edit/${r.id}` : undefined}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: number;
  tone?: "ink" | "gold";
}) {
  return (
    <Card className="flex items-center justify-between">
      <span className="text-sm font-bold text-[var(--color-ink-soft)]">{label}</span>
      <span
        className="text-3xl font-black"
        style={{ color: tone === "gold" ? "#9a7b00" : "var(--color-ink)" }}
      >
        {value}
      </span>
    </Card>
  );
}

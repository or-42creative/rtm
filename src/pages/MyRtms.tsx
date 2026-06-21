import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { appealRtm, notifyAdmins } from "@/lib/db";
import { currentMonthKey, monthLabel } from "@/lib/scores";
import type { Rtm } from "@/types";
import { Button, Card, EmptyState } from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";
import {
  RtmFilterBar,
  applyRtmFilter,
  defaultRtmFilter,
  type RtmFilter,
} from "@/components/RtmFilters";

export function MyRtmsPage() {
  const { appUser } = useAuth();
  const { rtms, clients, t } = useAppData();
  const myId = appUser?.employeeId ?? "";
  const uid = appUser?.uid;
  const [filter, setFilter] = useState<RtmFilter>(defaultRtmFilter);

  const { credited, thisMonthCount, totalIdea, amThisMonth, isAM } = useMemo(() => {
    const cm = currentMonthKey();
    const isIdea = (r: Rtm) => r.ideaOwnerIds.includes(myId);
    const isMine = (r: Rtm) => isIdea(r) || r.accountManagerId === myId;
    const credited = rtms.filter(isMine);
    const ideaActive = rtms.filter((r) => isIdea(r) && r.status !== "disqualified");
    const isAM = clients.some((c) => c.accountManagerId === myId);
    const amThisMonth = rtms.filter(
      (r) => r.accountManagerId === myId && r.monthKey === cm && r.status !== "disqualified",
    ).length;
    return {
      credited,
      thisMonthCount: ideaActive.filter((r) => r.monthKey === cm).length,
      totalIdea: ideaActive.length,
      amThisMonth,
      isAM,
    };
  }, [rtms, clients, myId]);

  const list = useMemo(() => applyRtmFilter(credited, filter), [credited, filter]);

  const appeal = (rtm: Rtm) => {
    const reason = window.prompt("מה סיבת הערעור?", rtm.appealReason ?? "");
    if (reason && reason.trim()) {
      void appealRtm(rtm.id, reason);
      void notifyAdmins("appeal", `ערעור חדש על "${rtm.name}".`, rtm.id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black">{t("my.title")}</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        כל RTM שיש לך עליו קרדיט — כבעל/ת רעיון או כמנהל/ת הלקוח.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label={`${t("my.statMonth")} (${monthLabel(currentMonthKey())})`} value={thisMonthCount} />
        <Stat label={t("my.statTotal")} value={totalIdea} />
        {isAM && <Stat label={t("my.statAm")} value={amThisMonth} tone="gold" />}
      </div>

      <div className="mt-8">
        {credited.length === 0 ? (
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
          <>
            <RtmFilterBar value={filter} onChange={setFilter} />
            {list.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--color-ink-soft)]">
                לא נמצאו RTMים שמתאימים לסינון.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => {
                  const mine = r.createdByUid === uid;
                  const dq = r.status === "disqualified";
                  return (
                    <RtmCard
                      key={r.id}
                      rtm={r}
                      showUploader
                      editHref={mine && !dq ? `/edit/${r.id}` : undefined}
                      onAppeal={mine && dq ? appeal : undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
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

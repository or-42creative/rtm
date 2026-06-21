import { Link } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import type { Rtm } from "@/types";
import { MediaPreview } from "./MediaPreview";
import { Badge, Card, cn } from "./ui";

const fmtDate = (rtm: Rtm): string => {
  const d = rtm.date?.toDate?.() ?? new Date();
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
};

/** A clickable RTM summary — opens the full item page (/rtm/:id). */
export function RtmCard({ rtm, showUploader }: { rtm: Rtm; showUploader?: boolean }) {
  const { employeeName } = useAppData();
  const dq = rtm.status === "disqualified";
  const likes = rtm.reactions ? Object.keys(rtm.reactions).length : 0;

  return (
    <Link to={`/rtm/${rtm.id}`} className="block">
      <Card
        className={cn(
          "overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md",
          dq && "border-red-200",
        )}
      >
        <div className={cn("p-4", dq && "opacity-60")}>
          <MediaPreview mediaType={rtm.mediaType} mediaUrl={rtm.mediaUrl} link={rtm.link} compact />
        </div>
        <div className="space-y-2 border-t border-[var(--color-line)] p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black leading-tight">{rtm.name}</h3>
            <span className="shrink-0 text-xs font-bold text-[var(--color-ink-soft)]">
              {fmtDate(rtm)}
            </span>
          </div>
          <div className="text-sm text-[var(--color-ink-soft)]">
            לקוח: <b className="text-[var(--color-ink)]">{rtm.clientName}</b>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {rtm.ideaOwnerIds.map((id) => (
              <Badge key={id} tone="accent">
                💡 {employeeName(id)}
              </Badge>
            ))}
            <Badge tone="neutral">🎯 {employeeName(rtm.accountManagerId)}</Badge>
            {likes > 0 && (
              <span className="text-sm font-black text-[var(--c-pink)]">❤️ {likes}</span>
            )}
          </div>
          {dq && (
            <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-black text-red-700">
              ⛔ נפסל
            </span>
          )}
          {showUploader && (
            <p className="text-xs text-[var(--color-ink-soft)]">
              ⬆️ הועלה ע״י:{" "}
              <b className="text-[var(--color-ink)]">
                {rtm.createdByEmployeeId ? employeeName(rtm.createdByEmployeeId) : "לא משויך"}
              </b>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import type { Rtm } from "@/types";
import { CONTENT_TYPE_EMOJI, CONTENT_TYPE_LABEL, DEFAULT_CONTENT_TYPE } from "@/data/contentTypes";
import { MediaPreview } from "./MediaPreview";
import { Badge, Card, cn } from "./ui";

const fmtDate = (rtm: Rtm): string => {
  const d = rtm.date?.toDate?.() ?? new Date();
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
};

const stop = (e: MouseEvent) => e.stopPropagation();

/** A clickable RTM summary — the card opens the item page; names inside link to
 *  the employee / client pages. */
export function RtmCard({ rtm, showUploader }: { rtm: Rtm; showUploader?: boolean }) {
  const { employeeName } = useAppData();
  const navigate = useNavigate();
  const dq = rtm.status === "disqualified";
  const likes = rtm.reactions ? Object.keys(rtm.reactions).length : 0;
  const ct = rtm.contentType ?? DEFAULT_CONTENT_TYPE;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/rtm/${rtm.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/rtm/${rtm.id}`)}
      className="cursor-pointer"
    >
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
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs font-bold text-[var(--color-ink-soft)]">{fmtDate(rtm)}</span>
              <span className="rounded-full bg-[var(--color-cloud)] px-2 py-0.5 text-[11px] font-bold">
                {CONTENT_TYPE_EMOJI[ct]} {CONTENT_TYPE_LABEL[ct]}
              </span>
            </div>
          </div>
          <div className="text-sm text-[var(--color-ink-soft)]">
            לקוח:{" "}
            <Link
              to={`/client/${rtm.clientId}`}
              onClick={stop}
              className="font-black text-[var(--color-ink)] hover:underline"
            >
              {rtm.clientName}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {rtm.ideaOwnerIds.map((id) => (
              <Link key={id} to={`/employee/${id}`} onClick={stop}>
                <Badge tone="accent">💡 {employeeName(id)}</Badge>
              </Link>
            ))}
            <Link to={`/employee/${rtm.accountManagerId}`} onClick={stop}>
              <Badge tone="neutral">🎯 {employeeName(rtm.accountManagerId)}</Badge>
            </Link>
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
              {rtm.createdByEmployeeId ? (
                <Link
                  to={`/employee/${rtm.createdByEmployeeId}`}
                  onClick={stop}
                  className="font-black text-[var(--color-ink)] hover:underline"
                >
                  {employeeName(rtm.createdByEmployeeId)}
                </Link>
              ) : (
                <b className="text-[var(--color-ink)]">לא משויך</b>
              )}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

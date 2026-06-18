import { Link } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import type { Rtm } from "@/types";
import { MediaPreview } from "./MediaPreview";
import { Badge, Button, Card, cn } from "./ui";

const fmtDate = (rtm: Rtm): string => {
  const d = rtm.date?.toDate?.() ?? new Date();
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function RtmCard({
  rtm,
  onDelete,
  editHref,
  onAppeal,
  onDisqualify,
  onReinstate,
  onResolveAppeal,
}: {
  rtm: Rtm;
  onDelete?: (rtm: Rtm) => void;
  editHref?: string;
  /** Owner action (their own disqualified RTM). */
  onAppeal?: (rtm: Rtm) => void;
  /** Admin actions. */
  onDisqualify?: (rtm: Rtm) => void;
  onReinstate?: (rtm: Rtm) => void;
  onResolveAppeal?: (rtm: Rtm, accept: boolean) => void;
}) {
  const { employeeName } = useAppData();
  const dq = rtm.status === "disqualified";
  const pending = rtm.appealStatus === "pending";

  const hasActions =
    editHref || onDelete || onAppeal || onDisqualify || onReinstate || onResolveAppeal;

  return (
    <Card className={cn("overflow-hidden p-0", dq && "border-red-200")}>
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
        </div>

        {dq && (
          <div className="rounded-xl bg-red-50 p-3 text-sm">
            <p className="font-black text-red-700">⛔ נפסל</p>
            {rtm.dqReason && (
              <p className="mt-0.5 text-red-700/90">סיבה: {rtm.dqReason}</p>
            )}
            {pending && (
              <p className="mt-1 font-bold text-amber-700">
                ערעור ממתין להכרעה{rtm.appealReason ? `: ${rtm.appealReason}` : ""}
              </p>
            )}
            {rtm.appealStatus === "rejected" && (
              <p className="mt-1 font-bold text-red-700">הערעור נדחה</p>
            )}
          </div>
        )}

        {hasActions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {editHref && !dq && (
              <Link to={editHref}>
                <Button variant="outline" className="px-3 py-1.5 text-xs">
                  עריכה
                </Button>
              </Link>
            )}
            {onAppeal && dq && !pending && (
              <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onAppeal(rtm)}>
                ערעור
              </Button>
            )}
            {onAppeal && pending && (
              <span className="self-center text-xs font-bold text-amber-700">ערעור נשלח ✓</span>
            )}
            {onDisqualify && !dq && (
              <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDisqualify(rtm)}>
                פסילה
              </Button>
            )}
            {onResolveAppeal && pending && (
              <>
                <Button variant="gold" className="px-3 py-1.5 text-xs" onClick={() => onResolveAppeal(rtm, true)}>
                  קבל ערעור
                </Button>
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onResolveAppeal(rtm, false)}>
                  דחה ערעור
                </Button>
              </>
            )}
            {onReinstate && dq && (
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => onReinstate(rtm)}>
                ביטול פסילה
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(rtm)}>
                מחיקה
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

import { Link } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import type { Rtm } from "@/types";
import { MediaPreview } from "./MediaPreview";
import { Badge, Button, Card } from "./ui";

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
}: {
  rtm: Rtm;
  onDelete?: (rtm: Rtm) => void;
  editHref?: string;
}) {
  const { employeeName } = useAppData();

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-4">
        <MediaPreview
          mediaType={rtm.mediaType}
          mediaUrl={rtm.mediaUrl}
          link={rtm.link}
          compact
        />
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
        {(editHref || onDelete) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {editHref && (
              <Link to={editHref}>
                <Button variant="outline" className="px-3 py-1.5 text-xs">
                  עריכה
                </Button>
              </Link>
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

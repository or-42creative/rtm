import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import {
  appealRtm,
  createClaim,
  createNotification,
  deleteRtm,
  disqualifyRtm,
  notifyAdmins,
  reinstateRtm,
  resolveAppeal,
} from "@/lib/db";
import type { ClaimCategory } from "@/types";
import { rtmPoints, TYPE_POINTS_FROM } from "@/lib/scores";
import { CONTENT_TYPE_EMOJI, CONTENT_TYPE_LABEL, DEFAULT_CONTENT_TYPE } from "@/data/contentTypes";
import { Badge, Button, Card, cn, inputClass } from "@/components/ui";
import { MediaPreview } from "@/components/MediaPreview";
import { LikeButton } from "@/components/LikeButton";

const CATS: { id: ClaimCategory; label: string }[] = [
  { id: "not_rtm", label: "זה לא RTM אמיתי" },
  { id: "wrong_credit", label: "הקרדיט לא נכון" },
  { id: "other", label: "משהו אחר" },
];

const fmtDate = (d?: Date) =>
  d ? d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }) : "—";

export function RtmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { rtms, employeeName, settings } = useAppData();
  const rtm = rtms.find((r) => r.id === id);

  const [claimOpen, setClaimOpen] = useState(false);
  const [claimCat, setClaimCat] = useState<ClaimCategory>("not_rtm");
  const [claimText, setClaimText] = useState("");
  const [claimSent, setClaimSent] = useState(false);

  if (!rtm) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <p className="text-lg font-black">ה‑RTM לא נמצא</p>
          <Button className="mt-3" variant="outline" onClick={() => navigate("/")}>
            חזרה לדאשבורד
          </Button>
        </Card>
      </div>
    );
  }

  const isAdmin = appUser?.role === "admin";
  const isOwner = rtm.createdByUid === appUser?.uid;
  const canManage = isAdmin || isOwner;
  const dq = rtm.status === "disqualified";
  const pending = rtm.appealStatus === "pending";
  const likes = rtm.reactions ? Object.keys(rtm.reactions).length : 0;
  const ct = rtm.contentType ?? DEFAULT_CONTENT_TYPE;
  const legacyType = rtm.monthKey < TYPE_POINTS_FROM || !rtm.contentType;
  const pts = rtmPoints(rtm, settings.typePoints);

  const submitClaim = async () => {
    if (!claimText.trim() || !appUser) return;
    await createClaim({
      rtmId: rtm.id,
      rtmName: rtm.name,
      byUid: appUser.uid,
      byEmployeeId: appUser.employeeId ?? null,
      category: claimCat,
      text: claimText.trim(),
    });
    await notifyAdmins("claim", `טענה חדשה על "${rtm.name}".`, rtm.id);
    setClaimSent(true);
    setClaimOpen(false);
    setClaimText("");
  };

  const appeal = async () => {
    const reason = window.prompt("מה סיבת הערעור?", rtm.appealReason ?? "");
    if (reason && reason.trim()) {
      await appealRtm(rtm.id, reason);
      await notifyAdmins("appeal", `ערעור חדש על "${rtm.name}".`, rtm.id);
    }
  };

  const disqualify = async () => {
    const reason = window.prompt("מה סיבת הפסילה?", rtm.dqReason ?? "");
    if (reason && reason.trim()) {
      await disqualifyRtm(rtm.id, reason);
      await createNotification({
        forUid: rtm.createdByUid,
        type: "disqualified",
        text: `ה‑RTM "${rtm.name}" נפסל. סיבה: ${reason.trim()}`,
        rtmId: rtm.id,
      });
    }
  };

  const reinstate = async () => {
    if (!confirm(`לבטל את הפסילה של "${rtm.name}"?`)) return;
    await reinstateRtm(rtm.id);
    await createNotification({
      forUid: rtm.createdByUid,
      type: "reinstated",
      text: `ה‑RTM "${rtm.name}" הוחזר לתחרות.`,
      rtmId: rtm.id,
    });
  };

  const resolve = async (accept: boolean) => {
    const q = accept
      ? `לקבל את הערעור ולהחזיר את "${rtm.name}" לתחרות?`
      : `לדחות את הערעור על "${rtm.name}"?`;
    if (!confirm(q)) return;
    await resolveAppeal(rtm.id, accept);
    await createNotification({
      forUid: rtm.createdByUid,
      type: accept ? "appeal_accepted" : "appeal_rejected",
      text: accept
        ? `הערעור על "${rtm.name}" התקבל — ה‑RTM הוחזר לתחרות.`
        : `הערעור על "${rtm.name}" נדחה.`,
      rtmId: rtm.id,
    });
  };

  const del = async () => {
    if (!confirm(`למחוק את "${rtm.name}"? פעולה בלתי הפיכה.`)) return;
    await deleteRtm(rtm.id);
    navigate("/me");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        → חזרה
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">{rtm.name}</h1>
        {dq ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-black text-red-700">
            ⛔ נפסל
          </span>
        ) : (
          <Badge tone="green">פעיל</Badge>
        )}
      </div>

      <Card className="space-y-3">
        <MediaPreview mediaType={rtm.mediaType} mediaUrl={rtm.mediaUrl} link={rtm.link} />
        {rtm.link && (
          <a
            href={rtm.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] px-4 py-2 text-sm font-bold hover:border-[var(--color-ink)]"
          >
            ↗ צפייה בפוסט המקורי
          </a>
        )}
      </Card>

      <Card className="space-y-2.5 text-sm">
        <Row label="לקוח">
          <Link to={`/client/${rtm.clientId}`} className="font-black hover:underline">
            {rtm.clientName}
          </Link>
        </Row>
        <Row label="תאריך">{fmtDate(rtm.date?.toDate?.())}</Row>
        <Row label="סוג">
          {legacyType ? (
            <Badge tone="neutral">תוכן · {pts} נק׳</Badge>
          ) : (
            <Badge tone="gold">
              {CONTENT_TYPE_EMOJI[ct]} {CONTENT_TYPE_LABEL[ct]} · {pts} נק׳
            </Badge>
          )}
        </Row>
        <Row label="הועלה ע״י">
          {rtm.createdByEmployeeId ? (
            <Link
              to={`/employee/${rtm.createdByEmployeeId}`}
              className="font-black hover:underline"
            >
              {employeeName(rtm.createdByEmployeeId)}
            </Link>
          ) : (
            <b>לא משויך</b>
          )}
        </Row>
        <Row label="קרדיט">
          <span className="flex flex-wrap gap-1.5">
            {rtm.ideaOwnerIds.map((oid) => (
              <Link key={oid} to={`/employee/${oid}`}>
                <Badge tone="accent">💡 {employeeName(oid)}</Badge>
              </Link>
            ))}
            <Link to={`/employee/${rtm.accountManagerId}`}>
              <Badge tone="neutral">🎯 {employeeName(rtm.accountManagerId)}</Badge>
            </Link>
          </span>
        </Row>
        <Row label="לייקים">
          <span className="flex items-center gap-2">
            <LikeButton rtm={rtm} />
            <span className="text-[var(--color-ink-soft)]">{likes} לייקים</span>
          </span>
        </Row>
      </Card>

      {canManage && dq && (
        <Card className="space-y-1 border-red-200 bg-red-50">
          <p className="font-black text-red-700">⛔ ה‑RTM נפסל</p>
          {rtm.dqReason && <p className="text-sm text-red-700/90">סיבה: {rtm.dqReason}</p>}
          {pending && (
            <p className="text-sm font-bold text-amber-700">
              ערעור ממתין להכרעה{rtm.appealReason ? `: ${rtm.appealReason}` : ""}
            </p>
          )}
          {rtm.appealStatus === "rejected" && (
            <p className="text-sm font-bold text-red-700">הערעור נדחה</p>
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setClaimOpen((o) => !o)}>
            יש לי טענה
          </Button>
          {isOwner && dq && !pending && (
            <Button variant="outline" onClick={() => void appeal()}>
              ערעור על הפסילה
            </Button>
          )}
          {isOwner && pending && (
            <span className="self-center text-sm font-bold text-amber-700">ערעור נשלח ✓</span>
          )}
          {(isAdmin || (isOwner && !dq)) && (
            <Link to={`/edit/${rtm.id}`}>
              <Button variant="outline">עריכה</Button>
            </Link>
          )}
          {isAdmin && !dq && (
            <Button variant="danger" onClick={() => void disqualify()}>
              פסילה
            </Button>
          )}
          {isAdmin && dq && (
            <Button variant="ghost" onClick={() => void reinstate()}>
              ביטול פסילה
            </Button>
          )}
          {isAdmin && pending && (
            <>
              <Button variant="gold" onClick={() => void resolve(true)}>
                קבל ערעור
              </Button>
              <Button variant="danger" onClick={() => void resolve(false)}>
                דחה ערעור
              </Button>
            </>
          )}
          {(isAdmin || isOwner) && (
            <Button variant="danger" onClick={() => void del()}>
              מחיקה
            </Button>
          )}
        </div>

        {claimSent && (
          <p className="text-sm font-bold text-green-600">הטענה נשלחה לאדמין ✓</p>
        )}

        {claimOpen && (
          <div className="space-y-3 rounded-xl bg-[var(--color-cloud)] p-4">
            <p className="font-black">יש לי טענה על ה‑RTM הזה</p>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClaimCat(c.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-bold transition",
                    claimCat === c.id
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-ink)]",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <textarea
              className={cn(inputClass, "min-h-24")}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="פירוט הטענה…"
            />
            <Button onClick={() => void submitClaim()} disabled={!claimText.trim()}>
              שליחה לאדמין
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-20 text-[var(--color-ink-soft)]">{label}:</span>
      <span>{children}</span>
    </div>
  );
}

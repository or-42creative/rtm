import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { ADMINS, markNotificationRead, subscribeNotifications } from "@/lib/db";
import type { AppNotification } from "@/types";
import { cn } from "./ui";

const fmt = (ts: AppNotification["createdAt"]): string => {
  const d = ts?.toDate?.();
  if (!d) return "עכשיו";
  return (
    d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }) +
    " · " +
    d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
  );
};

export function NotificationsBell() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const uid = appUser?.uid ?? "";
  const isAdmin = appUser?.role === "admin";

  const go = (n: AppNotification) => {
    setOpen(false);
    void markNotificationRead(n.id, uid);
    const dest =
      n.forUid === ADMINS && n.type === "claim"
        ? "/admin?tab=claims"
        : n.rtmId
          ? `/rtm/${n.rtmId}`
          : "/";
    navigate(dest);
  };

  useEffect(() => {
    if (!uid) return;
    return subscribeNotifications(uid, !!isAdmin, setItems);
  }, [uid, isAdmin]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unread = items.filter((n) => !(n.readBy ?? []).includes(uid));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) unread.forEach((n) => void markNotificationRead(n.id, uid));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative grid size-9 place-items-center rounded-full hover:bg-[var(--color-cloud)]"
        aria-label="התראות"
      >
        <span className="text-lg">🔔</span>
        {unread.length > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-black text-white">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-11 z-30 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-lg">
          <div className="border-b border-[var(--color-line)] px-4 py-2.5 text-sm font-black">
            התראות
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-ink-soft)]">
                אין התראות עדיין
              </p>
            ) : (
              items.map((n) => {
                const isUnread = !(n.readBy ?? []).includes(uid);
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n)}
                    className={cn(
                      "block w-full border-b border-[var(--color-line)] px-4 py-3 text-start text-sm transition last:border-0 hover:bg-[var(--color-cloud)]",
                      isUnread && "bg-[var(--color-accent-soft)]",
                    )}
                  >
                    <p className="font-bold leading-snug">{n.text}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{fmt(n.createdAt)}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

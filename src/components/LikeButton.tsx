import { useState, type MouseEvent } from "react";

import { useAuth } from "@/lib/auth";
import { toggleReaction } from "@/lib/db";
import type { Rtm } from "@/types";
import { cn } from "./ui";

export function LikeButton({
  rtm,
  className,
}: {
  rtm: Rtm;
  className?: string;
}) {
  const { appUser } = useAuth();
  const uid = appUser?.uid ?? "";
  const reactions = rtm.reactions ?? {};
  const liked = Boolean(reactions[uid]);
  const count = Object.keys(reactions).length;
  const [burst, setBurst] = useState(false);

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uid) return;
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 450);
    }
    void toggleReaction(rtm.id, uid, !liked);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? "ביטול לייק" : "לייק"}
      className={cn(
        "inline-flex items-center gap-1 font-black transition active:scale-90",
        liked ? "text-[var(--c-pink)]" : "text-[var(--color-ink-soft)]",
        className,
      )}
    >
      <span className={cn("text-base leading-none", burst && "heart-burst")}>
        {liked ? "❤️" : "🤍"}
      </span>
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}

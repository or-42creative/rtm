import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { parseSocial, type Platform } from "@/lib/social";
import type { Rtm } from "@/types";
import { LikeButton } from "./LikeButton";
import { Button, cn } from "./ui";

const TILE_GRADIENTS = [
  "from-[var(--c-pink)] to-[var(--c-purple)]",
  "from-[var(--c-blue)] to-[var(--c-teal)]",
  "from-[var(--c-orange)] to-[var(--c-pink)]",
  "from-[var(--c-lime)] to-[var(--c-teal)]",
  "from-[var(--c-purple)] to-[var(--c-blue)]",
  "from-[var(--c-teal)] to-[var(--c-lime)]",
];
const DECO_ICONS = ["✨", "🎬", "💡", "❤️", "🎯", "🚀", "📸", "🔥", "🎉", "⭐"];

const platformEmoji = (p?: Platform): string => {
  switch (p) {
    case "instagram":
      return "📸";
    case "tiktok":
      return "🎵";
    case "youtube":
      return "▶️";
    case "facebook":
      return "👍";
    case "twitter":
      return "🐦";
    case "linkedin":
      return "💼";
    default:
      return "✨";
  }
};

/** Columns adapt to the viewport (cap 2 on mobile, 3 on tablet, `max` on desktop). */
function useResponsiveCols(max: number): number {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  if (w < 640) return Math.min(2, max);
  if (w < 1024) return Math.min(3, max);
  return max;
}

/** Uniform square grid. Posts fill the cells; remaining cells become colorful
 *  decorative squares so the wall is always a full rectangle. "Load more" adds
 *  3 rows at a time. */
export function Collage({
  rtms,
  cols = 4,
  rows = 4,
}: {
  rtms: Rtm[];
  cols?: number;
  rows?: number;
}) {
  const effCols = useResponsiveCols(cols);
  const [visibleRows, setVisibleRows] = useState(rows);
  useEffect(() => setVisibleRows(rows), [rows]);

  const cells = effCols * visibleRows;
  const tiles = Array.from({ length: cells }, (_, i) =>
    i < rtms.length ? (
      <CollageTile key={rtms[i].id} rtm={rtms[i]} index={i} />
    ) : (
      <DecoTile key={`d${i}`} index={i} />
    ),
  );
  const remaining = rtms.length - cells;

  return (
    <div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${effCols}, minmax(0, 1fr))` }}
      >
        {tiles}
      </div>
      {remaining > 0 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setVisibleRows((r) => r + 3)}>
            הצגת עוד {remaining} פוסטים ↓
          </Button>
        </div>
      )}
    </div>
  );
}

function CollageTile({ rtm, index }: { rtm: Rtm; index: number }) {
  const grad = TILE_GRADIENTS[index % TILE_GRADIENTS.length];
  const social = rtm.link ? parseSocial(rtm.link) : null;
  const hasImage = rtm.mediaType === "image" && rtm.mediaUrl;
  const hasVideo = rtm.mediaType === "video" && rtm.mediaUrl;

  return (
    <Link
      to={`/rtm/${rtm.id}`}
      className="group relative block aspect-square overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-sm transition duration-300 animate-fade-up hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index, 15) * 35}ms` }}
    >
      {hasImage ? (
        <img
          src={rtm.mediaUrl!}
          alt={rtm.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : hasVideo ? (
        <>
          <video
            src={rtm.mediaUrl!}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center text-5xl text-white/90 drop-shadow-lg transition group-hover:scale-110">
            ▶
          </span>
        </>
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br p-3 text-center text-white",
            grad,
          )}
        >
          <span className="text-5xl drop-shadow">{platformEmoji(social?.platform)}</span>
          <span className="line-clamp-2 text-xs font-black leading-tight drop-shadow">
            {rtm.name}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 pt-8">
        <p className="truncate text-xs font-black text-white">{rtm.name}</p>
        <p className="truncate text-[10px] font-bold text-white/80">{rtm.clientName}</p>
      </div>

      <div className="absolute end-1.5 top-1.5">
        <LikeButton
          rtm={rtm}
          className="rounded-full bg-white/90 px-1.5 py-0.5 text-xs shadow-sm backdrop-blur"
        />
      </div>
    </Link>
  );
}

function DecoTile({ index }: { index: number }) {
  const grad = TILE_GRADIENTS[(index + 2) % TILE_GRADIENTS.length];
  const icon = DECO_ICONS[index % DECO_ICONS.length];
  return (
    <div
      className={cn(
        "grid aspect-square place-items-center rounded-2xl bg-gradient-to-br animate-fade-up",
        grad,
      )}
      style={{ animationDelay: `${Math.min(index, 15) * 35}ms` }}
    >
      <span className="text-4xl opacity-25">{icon}</span>
    </div>
  );
}

import type { CSSProperties } from "react";

import { parseSocial, type Platform } from "@/lib/social";
import type { Rtm } from "@/types";
import { LikeButton } from "./LikeButton";
import { cn } from "./ui";

const TILE_GRADIENTS = [
  "from-[var(--c-pink)] to-[var(--c-purple)]",
  "from-[var(--c-blue)] to-[var(--c-teal)]",
  "from-[var(--c-orange)] to-[var(--c-pink)]",
  "from-[var(--c-lime)] to-[var(--c-teal)]",
  "from-[var(--c-purple)] to-[var(--c-blue)]",
  "from-[var(--c-teal)] to-[var(--c-lime)]",
];

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

/** Pinterest-style colorful collage of the month's RTM media. The "wall of
 *  fame" size is admin-configurable: `cols` (width) × `rows` (length) tiles. */
export function Collage({
  rtms,
  cols = 4,
  rows = 3,
}: {
  rtms: Rtm[];
  cols?: number;
  rows?: number;
}) {
  const shown = rtms.slice(0, Math.max(1, cols * rows));
  return (
    <div
      className="collage"
      style={{ "--collage-cols": cols } as CSSProperties}
    >
      {shown.map((rtm, i) => (
        <CollageTile key={rtm.id} rtm={rtm} index={i} />
      ))}
    </div>
  );
}

function CollageTile({ rtm, index }: { rtm: Rtm; index: number }) {
  const grad = TILE_GRADIENTS[index % TILE_GRADIENTS.length];
  const social = rtm.link ? parseSocial(rtm.link) : null;
  const hasImage = rtm.mediaType === "image" && rtm.mediaUrl;
  const hasVideo = rtm.mediaType === "video" && rtm.mediaUrl;

  return (
    <a
      href={rtm.link || "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-sm transition duration-300 animate-fade-up hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}
    >
      {hasImage ? (
        <img
          src={rtm.mediaUrl!}
          alt={rtm.name}
          loading="lazy"
          className="w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : hasVideo ? (
        <div className="relative">
          <video
            src={rtm.mediaUrl!}
            muted
            playsInline
            preload="metadata"
            className="w-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center text-5xl text-white/90 drop-shadow-lg transition group-hover:scale-110">
            ▶
          </span>
        </div>
      ) : (
        <div
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-3 bg-gradient-to-br p-4 text-center text-white",
            grad,
          )}
        >
          <span className="text-5xl drop-shadow">{platformEmoji(social?.platform)}</span>
          <span className="line-clamp-3 text-sm font-black leading-tight drop-shadow">
            {rtm.name}
          </span>
        </div>
      )}

      {/* Caption overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3 pt-10">
        <p className="truncate text-sm font-black text-white">{rtm.name}</p>
        <p className="truncate text-xs font-bold text-white/80">{rtm.clientName}</p>
      </div>

      {/* Heart */}
      <div className="absolute end-2 top-2">
        <LikeButton
          rtm={rtm}
          className="rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur"
        />
      </div>
    </a>
  );
}

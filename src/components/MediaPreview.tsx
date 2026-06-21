import { useMemo } from "react";

import { parseSocial, embedHeight } from "@/lib/social";
import type { MediaType } from "@/types";
import { cn } from "./ui";

/**
 * Renders an RTM's media: an uploaded image/video when present, otherwise the
 * social post embedded via its platform's iframe, otherwise a link card.
 */
export function MediaPreview({
  mediaType,
  mediaUrl,
  link,
  className,
  compact,
}: {
  mediaType: MediaType;
  mediaUrl?: string | null;
  link?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const social = useMemo(() => (link ? parseSocial(link) : null), [link]);

  if (mediaType === "image" && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt=""
        className={cn("w-full rounded-xl object-cover", className)}
        loading="lazy"
      />
    );
  }

  if (mediaType === "video" && mediaUrl) {
    return (
      <video
        src={mediaUrl}
        controls
        className={cn("w-full rounded-xl bg-black", className)}
      />
    );
  }

  if (social?.iframeSrc && !compact) {
    return (
      <iframe
        src={social.iframeSrc}
        title={social.label}
        loading="lazy"
        scrolling="no"
        allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
        allowFullScreen
        className={cn("w-full rounded-xl border border-[var(--color-line)]", className)}
        style={{ height: embedHeight(social.platform) }}
      />
    );
  }

  if (link) {
    const label = social?.label ?? "פוסט";
    // Compact (inside a clickable card) → a non-anchor placeholder so it can be
    // wrapped in a Link without nesting <a>.
    if (compact) {
      return (
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--c-purple)] to-[var(--c-pink)] px-4 py-8 text-sm font-black text-white",
            className,
          )}
        >
          {label}
        </div>
      );
    }
    return (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-cloud)] px-4 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-ink)]",
          className,
        )}
      >
        <span>↗</span>
        <span>צפייה ב{label}</span>
      </a>
    );
  }

  return null;
}

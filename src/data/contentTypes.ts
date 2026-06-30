import type { ContentType } from "@/types";

/** The selectable RTM content types, in display order (least → most points). */
export const CONTENT_TYPES: { id: ContentType; label: string; emoji: string }[] = [
  { id: "comment", label: "תגובה", emoji: "💬" },
  { id: "post", label: "פוסט סטטי", emoji: "🖼️" },
  { id: "video", label: "וידאו", emoji: "🎬" },
];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  comment: "תגובה",
  post: "פוסט סטטי",
  video: "וידאו",
};

export const CONTENT_TYPE_EMOJI: Record<ContentType, string> = {
  comment: "💬",
  post: "🖼️",
  video: "🎬",
};

/** Older RTMs may have no `contentType`; treat them as a static post. */
export const DEFAULT_CONTENT_TYPE: ContentType = "post";

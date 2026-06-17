export type Platform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "twitter"
  | "linkedin"
  | "other";

export interface SocialInfo {
  platform: Platform;
  url: string;
  /** An iframe src that renders the post without an API key, when we can build
   *  one. null → we can't auto-embed; fall back to manual media upload. */
  iframeSrc: string | null;
  label: string;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  other: "קישור",
};

/** Best-effort parse of a social link into an embeddable iframe src. */
export function parseSocial(rawUrl: string): SocialInfo | null {
  const trimmed = (rawUrl ?? "").trim();
  if (!trimmed) return null;
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname;
  const make = (platform: Platform, iframeSrc: string | null): SocialInfo => ({
    platform,
    url: trimmed,
    iframeSrc,
    label: PLATFORM_LABEL[platform],
  });

  // Instagram — /p/, /reel/, /tv/  → official /embed renderer
  if (host.endsWith("instagram.com")) {
    const m = path.match(/\/(p|reel|tv)\/([^/]+)/);
    return make(
      "instagram",
      m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null,
    );
  }

  // TikTok — /@user/video/{id}
  if (host.endsWith("tiktok.com")) {
    const m = path.match(/\/video\/(\d+)/);
    return make("tiktok", m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null);
  }

  // YouTube — watch?v=, youtu.be/, shorts/
  if (host.endsWith("youtube.com") || host === "youtu.be") {
    let id: string | null = null;
    if (host === "youtu.be") id = path.slice(1);
    else if (path.startsWith("/shorts/")) id = path.split("/")[2];
    else id = u.searchParams.get("v");
    return make("youtube", id ? `https://www.youtube.com/embed/${id}` : null);
  }

  // X / Twitter — /user/status/{id}
  if (host.endsWith("twitter.com") || host.endsWith("x.com")) {
    const m = path.match(/\/status\/(\d+)/);
    return make(
      "twitter",
      m
        ? `https://platform.twitter.com/embed/Tweet.html?id=${m[1]}&theme=light`
        : null,
    );
  }

  // Facebook — generic post plugin
  if (host.endsWith("facebook.com") || host === "fb.watch") {
    return make(
      "facebook",
      `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        trimmed,
      )}&show_text=true&width=500`,
    );
  }

  if (host.endsWith("linkedin.com")) return make("linkedin", null);

  return make("other", null);
}

/** A sensible iframe height for each platform's embed (px). */
export function embedHeight(platform: Platform): number {
  switch (platform) {
    case "tiktok":
      return 740;
    case "instagram":
      return 640;
    case "youtube":
      return 320;
    case "twitter":
      return 560;
    case "facebook":
      return 640;
    default:
      return 480;
  }
}

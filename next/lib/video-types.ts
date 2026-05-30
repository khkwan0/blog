import type {
  DirectMediaType,
  StreamKind,
  VideoProvider,
} from "@/lib/video-url";

export type VideoBlockContent = {
  sourceUrl: string;
  provider: VideoProvider;
  videoId: string;
  status: "pending" | "ready" | "embedded" | "failed";
  isLive?: boolean;
  streamKind?: StreamKind;
  directType?: DirectMediaType;
  embedWidth?: number;
  embedHeight?: number;
  localPath?: string;
  error?: string;
};

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}

export function vimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`;
}

export function twitchEmbedUrl(
  videoId: string,
  streamKind: StreamKind | undefined,
  parentDomain: string,
): string {
  const endpoint = new URL("https://player.twitch.tv/");
  endpoint.searchParams.set("parent", parentDomain);

  if (streamKind === "video") {
    endpoint.searchParams.set("video", videoId);
  } else {
    endpoint.searchParams.set("channel", videoId);
  }

  return endpoint.toString();
}

export function kickEmbedUrl(channel: string): string {
  return `https://player.kick.com/${encodeURIComponent(channel)}`;
}

export function facebookEmbedUrl(
  sourceUrl: string,
  width: number,
  height: number,
): string {
  const endpoint = new URL("https://www.facebook.com/plugins/video.php");
  endpoint.searchParams.set("href", sourceUrl);
  endpoint.searchParams.set("show_text", "false");
  endpoint.searchParams.set("width", String(Math.round(width)));
  endpoint.searchParams.set("height", String(Math.round(height)));
  return endpoint.toString();
}

export function parseVideoBlockContent(content: string): VideoBlockContent | null {
  try {
    return JSON.parse(content) as VideoBlockContent;
  } catch {
    return null;
  }
}

export function localVideoUrl(localPath: string): string {
  return `/api/media/${localPath.split("/").map(encodeURIComponent).join("/")}`;
}

export function embedParentDomain(): string {
  const configured =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    return new URL(configured).hostname;
  } catch {
    return "localhost";
  }
}

import type { VideoProvider } from "@/lib/video-url";

export type VideoBlockContent = {
  sourceUrl: string;
  provider: VideoProvider;
  videoId: string;
  status: "pending" | "ready" | "failed";
  localPath?: string;
  error?: string;
};

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
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

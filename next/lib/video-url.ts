import { isHostedContentVideoUrl } from "@/lib/content-video-storage";

export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "tiktok"
  | "twitter"
  | "instagram"
  | "facebook"
  | "twitch"
  | "kick"
  | "direct";

export type StreamKind = "channel" | "video";

export type DirectMediaType = "file" | "hls";

export type ParsedVideoUrl = {
  provider: VideoProvider;
  url: string;
  videoId: string;
  isLive?: boolean;
  streamKind?: StreamKind;
  directType?: DirectMediaType;
};

const VIDEO_FILE_PATTERN = /\.(mp4|webm|mov|mkv|m4v)(\?|$)/i;
const HLS_PATTERN = /\.m3u8(\?|$)/i;

function parseYoutube(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id
      ? {
          provider: "youtube",
          videoId: id,
          url: `https://www.youtube.com/watch?v=${id}`,
        }
      : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id
        ? { provider: "youtube", videoId: id, url: `https://www.youtube.com/watch?v=${id}` }
        : null;
    }

    const liveMatch = url.pathname.match(/^\/live\/([\w-]{11})/);
    if (liveMatch) {
      const id = liveMatch[1]!;
      return {
        provider: "youtube",
        videoId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
        isLive: true,
      };
    }

    const shortsMatch = url.pathname.match(/^\/shorts\/([\w-]{11})/);
    if (shortsMatch) {
      const id = shortsMatch[1]!;
      return {
        provider: "youtube",
        videoId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }

    const embedMatch = url.pathname.match(/^\/embed\/([\w-]{11})/);
    if (embedMatch) {
      const id = embedMatch[1]!;
      return {
        provider: "youtube",
        videoId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  return null;
}

function parseVimeo(url: URL): ParsedVideoUrl | null {
  if (!url.hostname.replace(/^www\./, "").endsWith("vimeo.com")) {
    return null;
  }

  const id = url.pathname.match(/\/(\d+)/)?.[1];
  return id
    ? {
        provider: "vimeo",
        videoId: id,
        url: `https://vimeo.com/${id}`,
      }
    : null;
}

function parseTiktok(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "tiktok.com" && host !== "vm.tiktok.com") {
    return null;
  }

  return {
    provider: "tiktok",
    videoId: url.pathname.replace(/^\//, ""),
    url: url.toString(),
  };
}

function parseTwitter(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "twitter.com" && host !== "x.com") {
    return null;
  }

  if (!url.pathname.includes("/status/")) {
    return null;
  }

  return {
    provider: "twitter",
    videoId: url.pathname,
    url: url.toString(),
  };
}

function parseFacebook(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^(www\.|m\.|web\.|vm\.)/, "");

  if (host === "fb.watch") {
    const slug = url.pathname.slice(1).split("/")[0];
    return slug
      ? {
          provider: "facebook",
          videoId: slug,
          url: url.toString(),
        }
      : null;
  }

  if (host !== "facebook.com" && host !== "fb.com") {
    return null;
  }

  const reelMatch = url.pathname.match(/^\/reel\/(\d+)/);
  if (reelMatch) {
    const id = reelMatch[1]!;
    return {
      provider: "facebook",
      videoId: id,
      url: `https://www.facebook.com/reel/${id}`,
    };
  }

  if (url.pathname === "/watch" || url.pathname === "/watch/") {
    const id = url.searchParams.get("v");
    return id
      ? {
          provider: "facebook",
          videoId: id,
          url: `https://www.facebook.com/watch/?v=${id}`,
        }
      : null;
  }

  const videoMatch = url.pathname.match(/^\/[^/]+\/videos\/(\d+)/);
  if (videoMatch) {
    const id = videoMatch[1]!;
    return {
      provider: "facebook",
      videoId: id,
      url: `https://www.facebook.com${url.pathname}`,
    };
  }

  return null;
}

function parseInstagram(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "instagram.com") {
    return null;
  }

  if (!/^\/(reel|p|tv)\//.test(url.pathname)) {
    return null;
  }

  return {
    provider: "instagram",
    videoId: url.pathname,
    url: url.toString(),
  };
}

function parseTwitch(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "player.twitch.tv") {
    const channel = url.searchParams.get("channel");
    if (channel) {
      return {
        provider: "twitch",
        videoId: channel,
        url: `https://www.twitch.tv/${channel}`,
        isLive: true,
        streamKind: "channel",
      };
    }

    const video = url.searchParams.get("video");
    if (video) {
      return {
        provider: "twitch",
        videoId: video,
        url: `https://www.twitch.tv/videos/${video}`,
        streamKind: "video",
      };
    }

    return null;
  }

  if (host !== "twitch.tv" && host !== "m.twitch.tv") {
    return null;
  }

  const vodMatch = url.pathname.match(/^\/videos\/(\d+)/);
  if (vodMatch) {
    return {
      provider: "twitch",
      videoId: vodMatch[1]!,
      url: url.toString(),
      streamKind: "video",
    };
  }

  const channelMatch = url.pathname.match(/^\/([^/]+)\/?$/);
  const reserved = new Set(["videos", "directory", "p", "downloads", "settings"]);
  if (channelMatch && !reserved.has(channelMatch[1]!)) {
    const channel = channelMatch[1]!;
    return {
      provider: "twitch",
      videoId: channel,
      url: `https://www.twitch.tv/${channel}`,
      isLive: true,
      streamKind: "channel",
    };
  }

  return null;
}

function parseKick(url: URL): ParsedVideoUrl | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "kick.com") {
    return null;
  }

  const channelMatch = url.pathname.match(/^\/([^/]+)\/?$/);
  const reserved = new Set(["video", "categories", "browse", "following"]);
  if (!channelMatch || reserved.has(channelMatch[1]!)) {
    return null;
  }

  const channel = channelMatch[1]!;
  return {
    provider: "kick",
    videoId: channel,
    url: `https://kick.com/${channel}`,
    isLive: true,
    streamKind: "channel",
  };
}

function parseHostedContentVideo(rawUrl: string): ParsedVideoUrl | null {
  if (!isHostedContentVideoUrl(rawUrl)) {
    return null;
  }

  const pathname = rawUrl.split("?")[0] ?? rawUrl;
  if (!VIDEO_FILE_PATTERN.test(pathname)) {
    return null;
  }

  return {
    provider: "direct",
    videoId: rawUrl,
    url: rawUrl,
    directType: "file",
  };
}

function parseDirectMedia(url: URL): ParsedVideoUrl | null {
  const target = `${url.pathname}${url.search}`;

  if (HLS_PATTERN.test(target)) {
    return {
      provider: "direct",
      videoId: url.toString(),
      url: url.toString(),
      isLive: true,
      directType: "hls",
    };
  }

  if (VIDEO_FILE_PATTERN.test(target)) {
    return {
      provider: "direct",
      videoId: url.toString(),
      url: url.toString(),
      directType: "file",
    };
  }

  return null;
}

export function parseVideoUrl(rawUrl: string): ParsedVideoUrl | null {
  const hosted = parseHostedContentVideo(rawUrl.trim());
  if (hosted) {
    return hosted;
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (isHostedContentVideoUrl(url.pathname)) {
      return parseHostedContentVideo(url.pathname);
    }

    return (
      parseYoutube(url) ??
      parseTwitch(url) ??
      parseKick(url) ??
      parseVimeo(url) ??
      parseDirectMedia(url) ??
      parseTiktok(url) ??
      parseTwitter(url) ??
      parseInstagram(url) ??
      parseFacebook(url)
    );
  } catch {
    return null;
  }
}

export function findVideoLinks(links: string[]): ParsedVideoUrl[] {
  const seen = new Set<string>();
  const videos: ParsedVideoUrl[] = [];

  for (const link of links) {
    const parsed = parseVideoUrl(link);
    if (!parsed || seen.has(parsed.url)) {
      continue;
    }

    seen.add(parsed.url);
    videos.push(parsed);
  }

  return videos;
}

export function isEmbedOnlyVideo(video: ParsedVideoUrl): boolean {
  return (
    video.provider === "direct" ||
    video.provider === "twitch" ||
    video.provider === "kick" ||
    video.provider === "facebook" ||
    video.isLive === true
  );
}

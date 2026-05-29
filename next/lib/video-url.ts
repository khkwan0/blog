export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "tiktok"
  | "twitter"
  | "instagram";

export type ParsedVideoUrl = {
  provider: VideoProvider;
  url: string;
  videoId: string;
};

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

export function parseVideoUrl(rawUrl: string): ParsedVideoUrl | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return (
      parseYoutube(url) ??
      parseVimeo(url) ??
      parseTiktok(url) ??
      parseTwitter(url) ??
      parseInstagram(url)
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

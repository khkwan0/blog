export type FacebookEmbedDimensions = {
  width: number;
  height: number;
};

/** Guess aspect ratio from URL when oEmbed is unavailable. */
export function inferFacebookDimensions(sourceUrl: string): FacebookEmbedDimensions {
  try {
    const url = new URL(sourceUrl);
    const path = url.pathname.toLowerCase();

    if (path.includes("/reel/")) {
      return { width: 405, height: 720 };
    }
  } catch {
    // fall through
  }

  return { width: 560, height: 315 };
}

export async function fetchFacebookEmbedDimensions(
  sourceUrl: string,
): Promise<FacebookEmbedDimensions | null> {
  try {
    const endpoint = new URL("https://www.facebook.com/plugins/video/oembed.json/");
    endpoint.searchParams.set("url", sourceUrl);

    const response = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      width?: number;
      height?: number;
    };

    if (
      typeof data.width === "number" &&
      typeof data.height === "number" &&
      data.width > 0 &&
      data.height > 0
    ) {
      return { width: data.width, height: data.height };
    }
  } catch {
    return null;
  }

  return null;
}

export async function resolveFacebookEmbedDimensions(
  sourceUrl: string,
): Promise<FacebookEmbedDimensions> {
  return (await fetchFacebookEmbedDimensions(sourceUrl)) ?? inferFacebookDimensions(sourceUrl);
}

export function isVerticalFacebookEmbed(dimensions: FacebookEmbedDimensions) {
  return dimensions.height > dimensions.width;
}

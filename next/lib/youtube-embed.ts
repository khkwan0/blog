/** YouTube oEmbed succeeds when a video exists and is generally embeddable. */
export async function isYoutubeEmbeddable(url: string): Promise<boolean> {
  try {
    const endpoint = new URL("https://www.youtube.com/oembed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("format", "json");

    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(10_000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

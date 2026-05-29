const HREF_PATTERN = /href=["']([^"']+)["']/gi;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

export function extractLinksFromHtml(html: string): string[] {
  const links = new Set<string>();

  for (const match of html.matchAll(HREF_PATTERN)) {
    const href = match[1]?.trim();
    if (href && !href.startsWith("#") && !href.startsWith("mailto:")) {
      links.add(href);
    }
  }

  const text = html.replace(/<[^>]+>/g, " ");
  for (const match of text.matchAll(URL_PATTERN)) {
    links.add(match[0]!.replace(/[.,;:!?)]+$/, ""));
  }

  return [...links];
}

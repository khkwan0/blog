export type ParsedHashTag = {
  /** Lowercase normalized tag (without #). */
  hashtag: string;
  /** Original casing from the post (without #). */
  display: string;
};

export const HASHTAG_PATTERN = /#([\p{L}\p{N}_]+)/gu;

function addHashTag(
  tags: Map<string, ParsedHashTag>,
  raw: string,
): void {
  const display = raw.trim();
  if (!display) {
    return;
  }

  const hashtag = display.toLocaleLowerCase();
  if (!tags.has(hashtag)) {
    tags.set(hashtag, { hashtag, display });
  }
}

export function extractHashTags(...texts: (string | null | undefined)[]): ParsedHashTag[] {
  const tags = new Map<string, ParsedHashTag>();

  for (const text of texts) {
    if (!text) {
      continue;
    }

    HASHTAG_PATTERN.lastIndex = 0;
    for (const match of text.matchAll(HASHTAG_PATTERN)) {
      addHashTag(tags, match[1]!);
    }
  }

  return [...tags.values()];
}

export function extractHashTagsFromHtml(html: string): ParsedHashTag[] {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return extractHashTags(text);
}

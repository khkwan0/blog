export type ParsedMention = {
  /** Lowercase normalized username (without @ or braces). */
  username: string;
  /** Original casing from the post (without @ or braces). */
  display: string;
};

/** Matches @username and @{username} in plain text. */
export const MENTION_PATTERN = /@\{?([\p{L}\p{N}_]+)\}?/gu;

function addMention(mentions: Map<string, ParsedMention>, raw: string) {
  const display = raw.trim();
  if (!display) {
    return;
  }

  const username = display.toLowerCase();
  if (!mentions.has(username)) {
    mentions.set(username, { username, display });
  }
}

export function extractMentions(
  ...texts: (string | null | undefined)[]
): ParsedMention[] {
  const mentions = new Map<string, ParsedMention>();

  for (const text of texts) {
    if (!text) {
      continue;
    }

    MENTION_PATTERN.lastIndex = 0;
    for (const match of text.matchAll(MENTION_PATTERN)) {
      addMention(mentions, match[1]!);
    }
  }

  return [...mentions.values()];
}

export function extractMentionsFromHtml(html: string): ParsedMention[] {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return extractMentions(text);
}

export const DEFAULT_MENTION_COLOR_LIGHT = "#0369a1";
export const DEFAULT_MENTION_COLOR_DARK = "#38bdf8";
export const DEFAULT_HASHTAG_COLOR_LIGHT = "#6d28d9";
export const DEFAULT_HASHTAG_COLOR_DARK = "#a78bfa";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value.trim());
}

export function normalizeHexColor(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!isValidHexColor(trimmed)) {
    return null;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

export type ContentColorDefaults = {
  mentionLight: string;
  mentionDark: string;
  hashtagLight: string;
  hashtagDark: string;
};

export function getDefaultContentColors(): ContentColorDefaults {
  return {
    mentionLight: DEFAULT_MENTION_COLOR_LIGHT,
    mentionDark: DEFAULT_MENTION_COLOR_DARK,
    hashtagLight: DEFAULT_HASHTAG_COLOR_LIGHT,
    hashtagDark: DEFAULT_HASHTAG_COLOR_DARK,
  };
}

export function buildContentColorCss(
  mentionColor: string | null,
  hashtagColor: string | null,
) {
  const rules: string[] = [];

  if (mentionColor) {
    rules.push(`--post-mention-color: ${mentionColor};`);
  }

  if (hashtagColor) {
    rules.push(`--post-hashtag-color: ${hashtagColor};`);
  }

  if (rules.length === 0) {
    return "";
  }

  return `:root { ${rules.join(" ")} }`;
}

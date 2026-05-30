import { HASHTAG_PATTERN } from "@/lib/extract-hashtags";
import { MENTION_PATTERN } from "@/lib/extract-mentions";

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeAnchorTag(attrs: string): string {
  let next = attrs.trim();

  if (/\btarget\s*=/i.test(next)) {
    next = next.replace(/\btarget\s*=\s*["'][^"']*["']/i, 'target="_blank"');
  } else {
    next += ' target="_blank"';
  }

  if (/\brel\s*=/i.test(next)) {
    if (!/noopener/i.test(next)) {
      next = next.replace(
        /\brel\s*=\s*["']([^"']*)["']/i,
        (_, rel: string) => `rel="${rel} noopener noreferrer"`,
      );
    }
  } else {
    next += ' rel="noopener noreferrer"';
  }

  return next;
}

function linkifyMentions(text: string): string {
  return text.replace(MENTION_PATTERN, (match, raw) => {
    const username = raw.trim().toLowerCase();
    if (!username) {
      return match;
    }

    const href = `/user/${encodeURIComponent(username)}`;
    return `<a href="${escapeHtml(href)}" class="post-mention">${escapeHtml(match)}</a>`;
  });
}

function linkifyHashTags(text: string): string {
  return text.replace(HASHTAG_PATTERN, (match, raw) => {
    const hashtag = raw.trim().toLowerCase();
    if (!hashtag) {
      return match;
    }

    const href = `/tag/${encodeURIComponent(hashtag)}`;
    return `<a href="${escapeHtml(href)}" class="post-hashtag">${escapeHtml(match)}</a>`;
  });
}

function linkifyUrls(text: string): string {
  return text.replace(URL_PATTERN, (rawUrl) => {
    const url = rawUrl.replace(/[.,;:!?)]+$/, "");
    const trailing = rawUrl.slice(url.length);
    return `<a href="${escapeHtml(url)}" class="post-url" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
  });
}

function linkifyTextSegment(text: string): string {
  return linkifyUrls(linkifyHashTags(linkifyMentions(text)));
}

/** Makes mentions, hashtags, and plain URLs clickable in HTML text nodes. */
export function prepareHtmlLinks(html: string): string {
  const withSocial = html.replace(
    />([^<]+)</g,
    (_, text: string) => `>${linkifyTextSegment(text)}<`,
  );

  return withSocial.replace(
    /<a(\s[^>]*?)>/gi,
    (_, attrs: string) => {
      if (/\bclass\s*=\s*["'][^"']*(?:post-mention|post-hashtag)/i.test(attrs)) {
        return `<a ${attrs.trim()}>`;
      }

      return `<a ${normalizeAnchorTag(attrs)}>`;
    },
  );
}

/** Linkifies mentions, hashtags, and URLs in plain text (e.g. excerpts). */
export function preparePlainTextLinks(text: string): string {
  return linkifyTextSegment(escapeHtml(text));
}

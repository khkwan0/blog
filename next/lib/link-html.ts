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

function linkifyTextSegment(text: string): string {
  return text.replace(URL_PATTERN, (rawUrl) => {
    const url = rawUrl.replace(/[.,;:!?)]+$/, "");
    const trailing = rawUrl.slice(url.length);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
  });
}

/** Makes plain URLs clickable and opens all links in a new tab. */
export function prepareHtmlLinks(html: string): string {
  const withPlainUrls = html.replace(
    />([^<]+)</g,
    (_, text: string) => `>${linkifyTextSegment(text)}<`,
  );

  return withPlainUrls.replace(
    /<a(\s[^>]*?)>/gi,
    (_, attrs: string) => `<a ${normalizeAnchorTag(attrs)}>`,
  );
}

/** Linkifies plain-text URLs (e.g. excerpts) and opens them in a new tab. */
export function preparePlainTextLinks(text: string): string {
  return linkifyTextSegment(escapeHtml(text));
}

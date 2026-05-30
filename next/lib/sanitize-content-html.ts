import { isHostedContentImageUrl } from "@/lib/content-image-storage";

const EVENT_ATTR = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

function isAllowedImageSrc(src: string) {
  if (isHostedContentImageUrl(src)) {
    return true;
  }

  try {
    const url = new URL(src);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizeImgTag(attrs: string) {
  const srcMatch = attrs.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const rawSrc = srcMatch?.[2] ?? srcMatch?.[3] ?? srcMatch?.[4];
  if (!rawSrc || !isAllowedImageSrc(rawSrc)) {
    return "";
  }

  const altMatch = attrs.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
  const alt = altMatch?.[2] ?? altMatch?.[3] ?? "";
  const safeSrc = rawSrc
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const safeAlt = alt
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  return `<img src="${safeSrc}" alt="${safeAlt}" class="post-image" loading="lazy" decoding="async">`;
}

/** Strips scripts/event handlers and normalizes images in post/comment HTML. */
export function sanitizeContentHtml(html: string) {
  let next = html.replace(SCRIPT_TAG, "").replace(EVENT_ATTR, "");

  next = next.replace(/<img([^>]*?)>/gi, (_, attrs: string) =>
    sanitizeImgTag(attrs),
  );

  return next;
}

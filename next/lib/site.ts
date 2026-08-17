const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "shitsue",
  title: "shitsue",
  description:
    "A social blog for posts, discussions, and sharing ideas with friends.",
  locale: "en_US",
} as const;

export function siteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    DEFAULT_SITE_URL;

  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, siteUrl()).toString();
}

export function postUrl(postId: string): string {
  return absoluteUrl(`/post/${postId}`);
}

export function userUrl(username: string): string {
  return absoluteUrl(`/user/${encodeURIComponent(username)}`);
}

export function tagUrl(hashtag: string): string {
  return absoluteUrl(`/tag/${encodeURIComponent(hashtag)}`);
}

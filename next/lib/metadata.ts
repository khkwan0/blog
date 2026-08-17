import type { Metadata } from "next";
import { absoluteUrl, siteConfig, siteUrl } from "@/lib/site";

export const defaultMetadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const resolvedDescription = description ?? siteConfig.description;
  const resolvedImage = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(image)
    : undefined;

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      title,
      description: resolvedDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(resolvedImage ? { images: [{ url: resolvedImage }] } : {}),
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime, authors }
        : {}),
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : defaultMetadata.robots,
  };
}

export function extractFirstImageSrc(html: string): string | null {
  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (!match?.[1]) {
    return null;
  }

  const src = match[1].trim();
  if (!src || src.startsWith("data:")) {
    return null;
  }

  return src;
}

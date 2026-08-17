import type { MetadataRoute } from "next";
import {
  getSitemapHashtags,
  getSitemapPosts,
  getSitemapUsernames,
} from "@/lib/read/seo";
import { absoluteUrl, postUrl, tagUrl, userUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, users, hashtags] = await Promise.all([
    getSitemapPosts(),
    getSitemapUsernames(),
    getSitemapHashtags(),
  ]);

  type SitemapPost = (typeof posts)[number];
  type SitemapUser = (typeof users)[number];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post: SitemapPost) => ({
    url: postUrl(post.id),
    lastModified: post.modifiedAt ?? post.publishedAt ?? post.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const userRoutes: MetadataRoute.Sitemap = users.map((user: SitemapUser) => ({
    url: userUrl(user.username),
    lastModified: user.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = hashtags.map((hashtag: string) => ({
    url: tagUrl(hashtag),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...userRoutes, ...tagRoutes];
}

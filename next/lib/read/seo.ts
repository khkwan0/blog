import { publicPostWhere, viewablePostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ownerPublicSelect } from "@/lib/user-public";

export async function getSitemapPosts() {
  return prisma.blogEntry.findMany({
    where: {
      ...publicPostWhere,
      repostedFromId: null,
    },
    select: {
      id: true,
      modifiedAt: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getSitemapUsernames() {
  const users = await prisma.user.findMany({
    where: {
      blogEntries: {
        some: publicPostWhere,
      },
    },
    select: {
      username: true,
      updatedAt: true,
    },
    orderBy: { username: "asc" },
  });

  return users;
}

export async function getSitemapHashtags() {
  const rows = await prisma.hashTag.findMany({
    where: {
      blogEntry: {
        ...publicPostWhere,
        repostedFromId: null,
      },
    },
    distinct: ["hashtag"],
    select: { hashtag: true },
    orderBy: { hashtag: "asc" },
  });

  return rows.map((row) => row.hashtag);
}

export async function getPublishedPostSeo(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...viewablePostWhere },
    select: {
      id: true,
      title: true,
      excerpt: true,
      status: true,
      createdAt: true,
      modifiedAt: true,
      publishedAt: true,
      blocks: {
        where: { format: "HTML" },
        orderBy: { sortOrder: "asc" },
        select: { content: true },
        take: 1,
      },
      owner: {
        select: ownerPublicSelect,
      },
    },
  });
}

import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

const feedPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  totalLikes: true,
  createdAt: true,
  owner: {
    select: {
      name: true,
    },
  },
  ownerId: true,
  _count: {
    select: {
      comments: true,
    },
  },
  blocks: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      format: true,
      content: true,
      sortOrder: true,
    },
  },
};

const profilePostSelect = {
  id: true,
  title: true,
  excerpt: true,
  totalLikes: true,
  createdAt: true,
  _count: {
    select: {
      comments: true,
    },
  },
  blocks: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      format: true,
      content: true,
      sortOrder: true,
    },
  },
};

export async function getFeedPosts(ownerIds: string[]) {
  if (ownerIds.length === 0) {
    return [];
  }

  return prisma.blogEntry.findMany({
    where: {
      ...publicPostWhere,
      ownerId: { in: ownerIds },
    },
    orderBy: { createdAt: "desc" },
    select: feedPostSelect,
  });
}

export async function getPostsByHashtag(hashtag: string) {
  const normalized = hashtag.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return prisma.blogEntry.findMany({
    where: {
      ...publicPostWhere,
      hashTags: { some: { hashtag: normalized } },
    },
    orderBy: { createdAt: "desc" },
    select: feedPostSelect,
  });
}

export async function getPostsByOwner(ownerId: string) {
  return prisma.blogEntry.findMany({
    where: { ownerId, ...publicPostWhere },
    orderBy: { createdAt: "desc" },
    select: profilePostSelect,
  });
}

export async function getLikedPostIds(userId: string, postIds: string[]) {
  const liked = new Set<string>();

  if (postIds.length === 0) {
    return liked;
  }

  const rows = await prisma.blogEntryLike.findMany({
    where: {
      userId,
      blogEntryId: { in: postIds },
    },
    select: { blogEntryId: true },
  });

  for (const row of rows) {
    liked.add(row.blogEntryId);
  }

  return liked;
}

export async function getPublishedPostMetadata(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: { title: true, excerpt: true },
  });
}

export async function getPublishedPostForPage(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      owner: {
        select: {
          name: true,
        },
      },
      ownerId: true,
      blocks: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          format: true,
          content: true,
          sortOrder: true,
        },
      },
    },
  });
}

export async function getPublishedPostSummary(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: {
      id: true,
      title: true,
    },
  });
}

export async function getPostStatus(blogId: string) {
  return prisma.blogEntry.findUnique({
    where: { id: blogId },
    select: { status: true },
  });
}

export async function getPublishedPostForLike(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: { id: true, totalLikes: true },
  });
}

export async function getPostForArchive(blogId: string) {
  return prisma.blogEntry.findUnique({
    where: { id: blogId },
    select: { id: true, ownerId: true, status: true },
  });
}

export async function slugExists(slug: string) {
  const existing = await prisma.blogEntry.findUnique({
    where: { slug },
    select: { id: true },
  });

  return existing !== null;
}

export async function getPostLikeForUser(blogId: string, userId: string) {
  return prisma.blogEntryLike.findUnique({
    where: {
      blogEntryId_userId: {
        blogEntryId: blogId,
        userId,
      },
    },
  });
}

export async function getPostTotalLikes(blogId: string) {
  return prisma.blogEntry.findUnique({
    where: { id: blogId },
    select: { totalLikes: true },
  });
}

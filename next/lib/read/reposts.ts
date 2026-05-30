import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export async function getRepostedPostIds(userId: string, postIds: string[]) {
  const reposted = new Set<string>();

  if (postIds.length === 0) {
    return reposted;
  }

  const rows = await prisma.blogEntry.findMany({
    where: {
      ownerId: userId,
      repostedFromId: { in: postIds },
      ...publicPostWhere,
    },
    select: { repostedFromId: true },
  });

  for (const row of rows) {
    if (row.repostedFromId) {
      reposted.add(row.repostedFromId);
    }
  }

  return reposted;
}

export async function getUserRepostForPost(userId: string, rootPostId: string) {
  return prisma.blogEntry.findFirst({
    where: {
      ownerId: userId,
      repostedFromId: rootPostId,
      ...publicPostWhere,
    },
    select: { id: true },
  });
}

export async function getPublishedPostForRepost(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: {
      id: true,
      ownerId: true,
      repostedFromId: true,
      slug: true,
      totalReposts: true,
    },
  });
}

export async function resolveRepostRootId(blogId: string) {
  const post = await getPublishedPostForRepost(blogId);

  if (!post) {
    return null;
  }

  return post.repostedFromId ?? post.id;
}

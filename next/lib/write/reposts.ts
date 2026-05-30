import { prisma } from "@/lib/prisma";
import { slugExists } from "@/lib/read/posts";
import { uniqueSlug } from "@/lib/slug";
import {
  getPublishedPostForRepost,
  getUserRepostForPost,
} from "@/lib/read/reposts";
import { archivePost } from "@/lib/write/posts";

export async function toggleRepost(userId: string, blogId: string) {
  const post = await getPublishedPostForRepost(blogId);

  if (!post) {
    return { error: "Post not found.", status: 404 as const };
  }

  const rootId = post.repostedFromId ?? post.id;
  const root =
    rootId === post.id
      ? post
      : await getPublishedPostForRepost(rootId);

  if (!root) {
    return { error: "Post not found.", status: 404 as const };
  }

  if (root.ownerId === userId) {
    return { error: "You cannot repost your own post.", status: 403 as const };
  }

  const existing = await getUserRepostForPost(userId, rootId);

  if (existing) {
    await archivePost(existing.id);

    const updated = await prisma.blogEntry.findUnique({
      where: { id: rootId },
      select: { totalReposts: true },
    });

    return {
      reposted: false,
      totalReposts: Math.max(0, updated?.totalReposts ?? 0),
      status: 200 as const,
    };
  }

  const slug = await uniqueSlug(`repost-${root.slug}`, slugExists);

  await prisma.$transaction(async (tx) => {
    await tx.blogEntry.create({
      data: {
        slug,
        status: "PUBLISHED",
        publishedAt: new Date(),
        ownerId: userId,
        repostedFromId: rootId,
        blocks: {
          create: {
            format: "HTML",
            content: "<p></p>",
            sortOrder: 0,
          },
        },
      },
    });

    await tx.blogEntry.update({
      where: { id: rootId },
      data: { totalReposts: { increment: 1 } },
    });
  });

  const updated = await prisma.blogEntry.findUnique({
    where: { id: rootId },
    select: { totalReposts: true },
  });

  return {
    reposted: true,
    totalReposts: updated?.totalReposts ?? 1,
    status: 200 as const,
  };
}

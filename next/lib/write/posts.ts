import { Prisma } from "@prisma/client";
import { sanitizeContentHtml } from "@/lib/sanitize-content-html";
import { processPostHashTags } from "@/lib/process-post-hashtags";
import { processPostMentions } from "@/lib/write/mentions";
import { processPostVideos } from "@/lib/process-post-videos";
import { prisma } from "@/lib/prisma";
import {
  getPostLikeForUser,
  getPostTotalLikes,
  slugExists,
} from "@/lib/read/posts";
import { uniqueSlug } from "@/lib/slug";

export function excerptFromHtml(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return null;
  }

  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

export async function createPost(input: {
  ownerId: string;
  title: string | null;
  content: string;
  slug: string;
  publish: boolean;
}) {
  const content = sanitizeContentHtml(input.content);

  const post = await prisma.blogEntry.create({
    data: {
      ...(input.title !== null ? { title: input.title } : {}),
      slug: input.slug,
      excerpt: excerptFromHtml(content),
      status: "DRAFT",
      publishedAt: null,
      owner: { connect: { id: input.ownerId } },
      blocks: {
        create: {
          format: "HTML",
          content,
          sortOrder: 0,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!input.publish) {
    return {
      ...post,
      status: "DRAFT" as const,
      media: null,
      hashtags: null,
      mentions: null,
    };
  }

  const media = await processPostVideos(post.id);
  const hashtags = await processPostHashTags(post.id);
  const mentions = await processPostMentions(post.id);

  await prisma.blogEntry.update({
    where: { id: post.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  return {
    ...post,
    status: "PUBLISHED" as const,
    media,
    hashtags,
    mentions,
  };
}

export async function resolveUniqueSlug(source: string) {
  return uniqueSlug(source, slugExists);
}

export async function archivePost(blogId: string) {
  const post = await prisma.blogEntry.findUnique({
    where: { id: blogId },
    select: { repostedFromId: true, status: true },
  });

  await prisma.blogEntry.update({
    where: { id: blogId },
    data: { status: "ARCHIVED" },
  });

  if (post?.repostedFromId && post.status === "PUBLISHED") {
    await prisma.blogEntry.update({
      where: { id: post.repostedFromId },
      data: { totalReposts: { decrement: 1 } },
    });
  }
}

export async function togglePostLike(blogId: string, userId: string) {
  const existingLike = await getPostLikeForUser(blogId, userId);

  if (existingLike) {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.blogEntryLike.delete({
        where: { id: existingLike.id },
      });

      return tx.blogEntry.update({
        where: { id: blogId },
        data: {
          totalLikes: { decrement: 1 },
        },
        select: { totalLikes: true },
      });
    });

    return {
      liked: false,
      totalLikes: Math.max(0, updated.totalLikes),
    };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.blogEntryLike.create({
        data: {
          blogEntryId: blogId,
          userId,
        },
      });

      return tx.blogEntry.update({
        where: { id: blogId },
        data: {
          totalLikes: { increment: 1 },
        },
        select: { totalLikes: true },
      });
    });

    return {
      liked: true,
      totalLikes: updated.totalLikes,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const current = await getPostTotalLikes(blogId);
      return {
        liked: true,
        totalLikes: current?.totalLikes ?? 1,
      };
    }

    throw error;
  }
}

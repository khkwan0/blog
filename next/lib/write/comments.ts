import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeContentHtml } from "@/lib/sanitize-content-html";
import {
  getCommentLikeForUser,
  getCommentTotalLikes,
} from "@/lib/read/comments";

export async function createComment(input: {
  blogEntryId: string;
  userId: string;
  parentId: string | null;
  content: string;
}) {
  const content = sanitizeContentHtml(input.content);

  return prisma.comment.create({
    data: {
      blogEntryId: input.blogEntryId,
      userId: input.userId,
      parentId: input.parentId,
      content,
    },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function softDeleteComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
    select: { id: true },
  });
}

export async function toggleCommentLike(
  commentId: string,
  userId: string,
  fallbackTotalLikes: number,
) {
  const existingLike = await getCommentLikeForUser(commentId, userId);

  if (existingLike) {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.commentLike.delete({
        where: { id: existingLike.id },
      });

      return tx.comment.update({
        where: { id: commentId },
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
      await tx.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      return tx.comment.update({
        where: { id: commentId },
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
      const current = await getCommentTotalLikes(commentId);
      return {
        liked: true,
        totalLikes: current?.totalLikes ?? fallbackTotalLikes,
      };
    }

    throw error;
  }
}

import { activeCommentWhere } from "@/lib/comments";
import { viewablePostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

const commentSelect = {
  id: true,
  parentId: true,
  content: true,
  deletedAt: true,
  createdAt: true,
  totalLikes: true,
  user: {
    select: {
      id: true,
      username: true,
      name: true,
    },
  },
  _count: {
    select: {
      replies: { where: activeCommentWhere },
    },
  },
} as const;

export type CommentRecord = {
  id: string;
  parentId: string | null;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
  totalLikes: number;
  user: { id: string; username: string; name: string };
  _count: { replies: number };
};

export async function fetchCommentsForPost(
  blogEntryId: string,
  parentId: string | null,
): Promise<CommentRecord[]> {
  return prisma.comment.findMany({
    where: { blogEntryId, parentId },
    orderBy: { createdAt: "asc" },
    select: commentSelect,
  });
}

export async function fetchAllCommentsForPost(
  blogEntryId: string,
): Promise<CommentRecord[]> {
  return prisma.comment.findMany({
    where: { blogEntryId },
    orderBy: { createdAt: "asc" },
    select: commentSelect,
  });
}

export async function likedCommentIds(
  userId: string,
  commentIds: string[],
): Promise<Set<string>> {
  const liked = new Set<string>();

  if (commentIds.length === 0) {
    return liked;
  }

  const rows = await prisma.commentLike.findMany({
    where: {
      userId,
      commentId: { in: commentIds },
    },
    select: { commentId: true },
  });

  for (const row of rows) {
    liked.add(row.commentId);
  }

  return liked;
}

export async function getCommentThreadMetadata(
  blogId: string,
  commentId: string,
) {
  return prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId },
    select: {
      blogEntry: {
        select: { title: true, status: true },
      },
    },
  });
}

export async function getCommentOnPost(blogId: string, commentId: string) {
  return prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId },
    select: {
      id: true,
      parentId: true,
      content: true,
      deletedAt: true,
      createdAt: true,
      totalLikes: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
  });
}

export async function getPublishedPostIdForComment(blogId: string) {
  return prisma.blogEntry.findFirst({
    where: { id: blogId, ...viewablePostWhere },
    select: { id: true },
  });
}

export async function getParentComment(blogId: string, parentId: string) {
  return prisma.comment.findFirst({
    where: { id: parentId, blogEntryId: blogId },
    select: { id: true },
  });
}

export async function getCommentForSoftDelete(blogId: string, commentId: string) {
  return prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId, ...activeCommentWhere },
    select: { id: true, userId: true, deletedAt: true },
  });
}

export async function getCommentForLike(blogId: string, commentId: string) {
  return prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId, ...activeCommentWhere },
    select: { id: true, totalLikes: true },
  });
}

export async function getCommentLikeForUser(
  commentId: string,
  userId: string,
) {
  return prisma.commentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId,
      },
    },
  });
}

export async function getCommentTotalLikes(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: { totalLikes: true },
  });
}

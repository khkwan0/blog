import { prisma } from "@/lib/prisma";

export type CommentRecord = {
  id: string;
  content: string;
  createdAt: Date;
  totalLikes: number;
  user: { name: string };
  _count: { replies: number };
};

export async function fetchCommentsForPost(
  blogEntryId: string,
  parentId: string | null,
): Promise<CommentRecord[]> {
  return prisma.comment.findMany({
    where: { blogEntryId, parentId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      totalLikes: true,
      user: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
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

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string; commentId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId, commentId } = await context.params;

  const post = await prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId },
    select: { id: true, totalLikes: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId: session.user.id,
      },
    },
  });

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

    return NextResponse.json({
      liked: false,
      totalLikes: Math.max(0, updated.totalLikes),
    });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.commentLike.create({
        data: {
          commentId,
          userId: session.user.id,
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

    return NextResponse.json({
      liked: true,
      totalLikes: updated.totalLikes,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const current = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { totalLikes: true },
      });

      return NextResponse.json({
        liked: true,
        totalLikes: current?.totalLikes ?? comment.totalLikes,
      });
    }

    throw error;
  }
}

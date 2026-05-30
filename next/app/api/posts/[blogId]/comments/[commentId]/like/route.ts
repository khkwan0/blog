import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-session";
import {
  getCommentForLike,
  getPublishedPostIdForComment,
} from "@/lib/read/comments";
import { toggleCommentLike } from "@/lib/write/comments";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string; commentId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId, commentId } = await context.params;

  const post = await getPublishedPostIdForComment(blogId);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await getCommentForLike(blogId, commentId);

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const result = await toggleCommentLike(
    commentId,
    session.user.id,
    comment.totalLikes,
  );

  return NextResponse.json(result);
}

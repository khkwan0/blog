import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DELETE_SECTION, isDeleteSection } from "@/lib/api-section";
import { getApiSession } from "@/lib/api-session";
import { canDeleteComment } from "@/lib/comment-permissions";
import {
  getCommentForSoftDelete,
  getPublishedPostIdForComment,
} from "@/lib/read/comments";
import { softDeleteComment } from "@/lib/write/comments";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string; commentId: string }>;
};

type DeleteCommentBody = {
  section?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as DeleteCommentBody;

  if (!isDeleteSection(body.section)) {
    return NextResponse.json(
      { error: `Invalid section. Expected "${DELETE_SECTION}".` },
      { status: 400 },
    );
  }

  const { blogId, commentId } = await context.params;

  const post = await getPublishedPostIdForComment(blogId);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await getCommentForSoftDelete(blogId, commentId);

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (
    !canDeleteComment(comment, {
      id: session.user.id,
      role: session.user.role,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await softDeleteComment(commentId);

  revalidatePath(`/blog/${blogId}`);
  revalidatePath(`/post/${blogId}`);
  revalidatePath(`/blog/${blogId}/comment/${commentId}`);
  revalidatePath(`/post/${blogId}/comment/${commentId}`);

  return NextResponse.json({ ok: true });
}

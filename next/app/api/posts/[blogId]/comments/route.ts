import { NextResponse } from "next/server";
import { COMMENT_SECTION, isCommentSection } from "@/lib/api-section";
import { getApiSession } from "@/lib/api-session";
import {
  getParentComment,
  getPublishedPostIdForComment,
} from "@/lib/read/comments";
import { isEmptyEditorHtml } from "@/lib/is-empty-editor-html";
import { createComment } from "@/lib/write/comments";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

type CreateCommentBody = {
  content?: string;
  section?: string;
  parentId?: string | null;
};

function isEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return isEmptyEditorHtml(html, text);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId } = await context.params;
  const body = (await request.json()) as CreateCommentBody;

  if (!isCommentSection(body.section)) {
    return NextResponse.json(
      { error: `Invalid section. Expected "${COMMENT_SECTION}".` },
      { status: 400 },
    );
  }

  const content = body.content?.trim();
  if (!content || isEmptyHtml(content)) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const post = await getPublishedPostIdForComment(blogId);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const parentId = body.parentId?.trim() || null;

  if (parentId) {
    const parent = await getParentComment(blogId, parentId);

    if (!parent) {
      return NextResponse.json(
        { error: "Parent comment not found." },
        { status: 404 },
      );
    }
  }

  const comment = await createComment({
    blogEntryId: blogId,
    userId: session.user.id,
    parentId,
    content,
  });

  return NextResponse.json(comment, { status: 201 });
}

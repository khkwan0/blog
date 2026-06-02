import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession } from "@/lib/api-session";
import { isEmptyEditorHtml } from "@/lib/is-empty-editor-html";
import { getPostForEdit } from "@/lib/read/posts";
import { updatePostContent } from "@/lib/write/posts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

type UpdatePostBody = {
  content?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId } = await context.params;
  const body = (await request.json()) as UpdatePostBody;
  const content = body.content?.trim();

  const plainText =
    content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";

  if (!content || isEmptyEditorHtml(content, plainText)) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const editable = await getPostForEdit(blogId, session.user.id);

  if (!editable) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const result = await updatePostContent({
    blogId,
    ownerId: session.user.id,
    content,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePath("/");
  revalidatePath(`/blog/${blogId}`);
  revalidatePath(`/blog/${blogId}/edit`);
  revalidatePath(`/post/${blogId}`);
  revalidatePath(`/post/${blogId}/edit`);
  if (session.user.username) {
    revalidatePath(`/user/${session.user.username}`);
  }

  return NextResponse.json({ id: result.id });
}

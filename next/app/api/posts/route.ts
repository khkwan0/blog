import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession } from "@/lib/api-session";
import { isEmptyEditorHtml } from "@/lib/is-empty-editor-html";
import {
  createPost,
  excerptFromHtml,
  resolveUniqueSlug,
} from "@/lib/write/posts";

export const dynamic = "force-dynamic";

type CreatePostBody = {
  title?: string;
  content?: string;
  status?: "DRAFT" | "PUBLISHED";
};

export async function POST(request: Request) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreatePostBody;
  const title = body.title?.trim() || null;
  const content = body.content?.trim();
  const wantsPublish = body.status !== "DRAFT";

  const plainText = content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  if (!content || isEmptyEditorHtml(content, plainText)) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const slugSource = title ?? excerptFromHtml(content) ?? "post";
  const slug = await resolveUniqueSlug(slugSource);

  const post = await createPost({
    ownerId: session.user.id,
    title,
    content,
    slug,
    publish: wantsPublish,
  });

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (wantsPublish) {
    revalidatePath(`/post/${post.id}`);
    if (session.user.username) {
      revalidatePath(`/user/${session.user.username}`);
    }
  }

  return NextResponse.json(post, { status: 201 });
}

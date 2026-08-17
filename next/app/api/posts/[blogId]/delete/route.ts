import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DELETE_SECTION, isDeleteSection } from "@/lib/api-section";
import { getApiSession } from "@/lib/api-session";
import { getPostForArchive } from "@/lib/read/posts";
import { archivePost } from "@/lib/write/posts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

type DeletePostBody = {
  section?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as DeletePostBody;

  if (!isDeleteSection(body.section)) {
    return NextResponse.json(
      { error: `Invalid section. Expected "${DELETE_SECTION}".` },
      { status: 400 },
    );
  }

  const { blogId } = await context.params;

  const post = await getPostForArchive(blogId);

  if (!post || post.status === "ARCHIVED") {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await archivePost(blogId);

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/blog/${blogId}`);
  revalidatePath(`/post/${blogId}`);

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-session";
import { getPublishedPostForLike } from "@/lib/read/posts";
import { togglePostLike } from "@/lib/write/posts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId } = await context.params;

  const post = await getPublishedPostForLike(blogId);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const result = await togglePostLike(blogId, session.user.id);

  return NextResponse.json(result);
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DELETE_SECTION, isDeleteSection } from "@/lib/api-section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

type DeletePostBody = {
  section?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  const post = await prisma.blogEntry.findUnique({
    where: { id: blogId },
    select: { id: true, ownerId: true, status: true },
  });

  if (!post || post.status === "ARCHIVED") {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.blogEntry.update({
    where: { id: blogId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/");
  revalidatePath(`/blog/${blogId}`);

  return NextResponse.json({ ok: true });
}

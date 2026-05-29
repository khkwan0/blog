import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { COMMENT_SECTION, isCommentSection } from "@/lib/api-section";
import { auth } from "@/lib/auth";
import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

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
  return !text || html === "<p></p>";
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  const post = await prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const parentId = body.parentId?.trim() || null;

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, blogEntryId: blogId },
      select: { id: true },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found." }, { status: 404 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      blogEntryId: blogId,
      userId: session.user.id,
      parentId,
      content,
    },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}

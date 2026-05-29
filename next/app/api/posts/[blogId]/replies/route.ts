import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { isReplySection, REPLY_SECTION } from "@/lib/api-section";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

type CreateReplyBody = {
  content?: string;
  section?: string;
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
  const body = (await request.json()) as CreateReplyBody;

  if (!isReplySection(body.section)) {
    return NextResponse.json(
      { error: `Invalid section. Expected "${REPLY_SECTION}".` },
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

  const reply = await prisma.blogEntryReply.create({
    data: {
      blogEntryId: blogId,
      userId: session.user.id,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(reply, { status: 201 });
}

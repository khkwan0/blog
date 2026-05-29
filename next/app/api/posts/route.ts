import { after } from "next/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processPostVideos } from "@/lib/process-post-videos";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

type CreatePostBody = {
  title?: string;
  content?: string;
  status?: "DRAFT" | "PUBLISHED";
};

function excerptFromHtml(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return null;
  }

  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreatePostBody;
  const title = body.title?.trim() || null;
  const content = body.content?.trim();
  const status = body.status === "DRAFT" ? "DRAFT" : "PUBLISHED";

  if (!content || content === "<p></p>") {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const slugSource = title ?? excerptFromHtml(content) ?? "post";
  const slug = await uniqueSlug(slugSource, async (candidate) => {
    const existing = await prisma.blogEntry.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  const post = await prisma.blogEntry.create({
    data: {
      ...(title !== null ? { title } : {}),
      slug,
      excerpt: excerptFromHtml(content),
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      owner: { connect: { id: session.user.id } },
      blocks: {
        create: {
          format: "HTML",
          content,
          sortOrder: 0,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  after(() => {
    void processPostVideos(post.id);
  });

  return NextResponse.json(post, { status: 201 });
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentActions } from "@/components/comment-actions";
import { CommentEditor } from "@/components/comment-editor";
import { CommentsList } from "@/components/comments-list";
import { PostHtmlContent } from "@/components/post-html-content";
import { HeaderNav } from "@/components/header-nav";
import { auth } from "@/lib/auth";
import { fetchCommentsForPost, likedCommentIds } from "@/lib/comments";
import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string; commentId: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogId, commentId } = await params;

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId },
    select: {
      blogEntry: {
        select: { title: true, status: true },
      },
    },
  });

  if (!comment || comment.blogEntry.status !== "PUBLISHED") {
    return { title: "Comment not found" };
  }

  return {
    title: comment.blogEntry.title
      ? `Reply · ${comment.blogEntry.title}`
      : "Comment thread",
  };
}

export default async function CommentThreadPage({ params }: PageProps) {
  const { blogId, commentId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const post = await prisma.blogEntry.findFirst({
    where: { id: blogId, ...publicPostWhere },
    select: {
      id: true,
      title: true,
    },
  });

  if (!post) {
    notFound();
  }

  const parentComment = await prisma.comment.findFirst({
    where: { id: commentId, blogEntryId: blogId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      totalLikes: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!parentComment) {
    notFound();
  }

  const replies = await fetchCommentsForPost(blogId, commentId);
  const allIds = [parentComment.id, ...replies.map((reply) => reply.id)];
  const likedIds = session
    ? await likedCommentIds(session.user.id, allIds)
    : new Set<string>();

  const parentItem = {
    ...parentComment,
    likedByUser: likedIds.has(parentComment.id),
  };

  const replyItems = replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt,
    totalLikes: reply.totalLikes,
    likedByUser: likedIds.has(reply.id),
    user: reply.user,
  }));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4 pr-36">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight hover:text-accent"
          >
            shitsue
          </Link>
          <HeaderNav
            isSignedIn={Boolean(session)}
            username={session?.user.name ?? null}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href={`/blog/${blogId}`}
          className="text-sm text-muted link-accent"
        >
          ← Back to {post.title ?? "post"}
        </Link>

        <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {parentItem.user.name}
            {` · ${formatDate(parentItem.createdAt)}`}
          </p>
          <PostHtmlContent
            html={parentItem.content}
            className="post-content mt-2"
          />
          <CommentActions
            blogId={blogId}
            commentId={parentItem.id}
            totalLikes={parentItem.totalLikes}
            likedByUser={parentItem.likedByUser}
            isSignedIn={Boolean(session)}
          />
        </article>

        <CommentEditor
          blogEntryId={blogId}
          parentId={commentId}
          isSignedIn={Boolean(session)}
          heading="Reply"
          submitLabel="Post reply"
        />

        <CommentsList
          blogId={blogId}
          comments={replyItems}
          isSignedIn={Boolean(session)}
          heading="Replies"
          emptyMessage="No replies yet."
        />
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentItem } from "@/components/comment-item";
import { CommentsList } from "@/components/comments-list";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";
import { canDeleteComment } from "@/lib/comment-permissions";
import { isPostViewable } from "@/lib/posts";
import {
  fetchCommentsForPost,
  getCommentOnPost,
  getCommentThreadMetadata,
  likedCommentIds,
} from "@/lib/read/comments";
import { getPublishedPostSummary } from "@/lib/read/posts";
import { createPageMetadata, privatePageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string; commentId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogId, commentId } = await params;

  const comment = await getCommentThreadMetadata(blogId, commentId);

  if (!comment || !isPostViewable(comment.blogEntry.status)) {
    return { title: "Comment not found", ...privatePageMetadata };
  }

  const title = comment.blogEntry.title
    ? `Reply · ${comment.blogEntry.title}`
    : "Comment thread";

  return createPageMetadata({
    title,
    path: `/post/${blogId}/comment/${commentId}`,
    noIndex: true,
  });
}

export default async function CommentThreadPage({ params }: PageProps) {
  const { blogId, commentId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const post = await getPublishedPostSummary(blogId);

  if (!post) {
    notFound();
  }

  const parentComment = await getCommentOnPost(blogId, commentId);

  if (!parentComment) {
    notFound();
  }

  const replies = await fetchCommentsForPost(blogId, commentId);
  const allIds = [parentComment.id, ...replies.map((reply) => reply.id)];
  const likedIds = session
    ? await likedCommentIds(session.user.id, allIds)
    : new Set<string>();

  const viewer = session
    ? { id: session.user.id, role: session.user.role }
    : null;

  const parentItem = {
    id: parentComment.id,
    parentId: parentComment.parentId,
    content: parentComment.content,
    deletedAt: parentComment.deletedAt,
    createdAt: parentComment.createdAt,
    totalLikes: parentComment.totalLikes,
    likedByUser: likedIds.has(parentComment.id),
    canDelete: canDeleteComment(
      { userId: parentComment.userId, deletedAt: parentComment.deletedAt },
      viewer,
    ),
    user: parentComment.user,
  };

  const replyItems = replies.map((reply) => ({
    id: reply.id,
    parentId: reply.parentId,
    content: reply.content,
    deletedAt: reply.deletedAt,
    createdAt: reply.createdAt,
    totalLikes: reply.totalLikes,
    likedByUser: likedIds.has(reply.id),
    canDelete: canDeleteComment(
      { userId: reply.user.id, deletedAt: reply.deletedAt },
      viewer,
    ),
    user: reply.user,
  }));

  return (
    <div className="page-shell">
      <SiteHeader>
        <HeaderNav
          isSignedIn={Boolean(session)}
          username={session?.user.username ?? null}
          displayName={session?.user.name ?? null}
          avatarImage={session?.user.image}
        />
      </SiteHeader>

      <main className="page-main max-w-3xl">
        <Link
          href={`/post/${blogId}`}
          className="text-sm text-muted link-accent"
        >
          ← Back to {post.title ?? "post"}
        </Link>

        <CommentItem
          as="div"
          className="surface-card mt-6"
          blogId={blogId}
          comment={parentItem}
          isSignedIn={Boolean(session)}
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

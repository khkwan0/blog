import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentActions } from "@/components/comment-actions";
import { CommentEditor } from "@/components/comment-editor";
import { CommentsList } from "@/components/comments-list";
import { PostHtmlContent } from "@/components/post-html-content";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { UserProfileLink } from "@/components/user-profile-link";
import { auth } from "@/lib/auth";
import {
  fetchCommentsForPost,
  getCommentOnPost,
  getCommentThreadMetadata,
  likedCommentIds,
} from "@/lib/read/comments";
import { getPublishedPostSummary } from "@/lib/read/posts";
import { followedUserIds } from "@/lib/read/social-graph";
import { formatPostTimestamp } from "@/lib/format-datetime";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string; commentId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogId, commentId } = await params;

  const comment = await getCommentThreadMetadata(blogId, commentId);

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

  const authorIds = [
    parentComment.user.id,
    ...replies.map((reply) => reply.user.id),
  ];
  const followedAuthors = session
    ? await followedUserIds(session.user.id, authorIds)
    : new Set<string>();

  const parentItem = {
    ...parentComment,
    likedByUser: likedIds.has(parentComment.id),
    followedByViewer: followedAuthors.has(parentComment.user.id),
  };

  const replyItems = replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt,
    totalLikes: reply.totalLikes,
    likedByUser: likedIds.has(reply.id),
    user: reply.user,
    followedByViewer: followedAuthors.has(reply.user.id),
  }));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader>
        <HeaderNav
          isSignedIn={Boolean(session)}
          username={session?.user.username ?? null}
          displayName={session?.user.name ?? null}
          avatarImage={session?.user.image}
        />
      </SiteHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href={`/blog/${blogId}`}
          className="text-sm text-muted link-accent"
        >
          ← Back to {post.title ?? "post"}
        </Link>

        <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <UserProfileLink
              username={parentItem.user.username}
              displayName={parentItem.user.name}
              userId={parentItem.user.id}
              isSignedIn={Boolean(session)}
              viewerId={session?.user.id}
              initialFollowing={parentItem.followedByViewer}
            />
            <span aria-hidden>·</span>
            <span>{formatPostTimestamp(parentItem.createdAt)}</span>
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
          viewerId={session?.user.id}
          heading="Replies"
          emptyMessage="No replies yet."
        />
      </main>
    </div>
  );
}

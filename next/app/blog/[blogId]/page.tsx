import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentEditor } from "@/components/comment-editor";
import { CommentsList } from "@/components/comments-list";
import { PostActions } from "@/components/post-actions";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostEditButton } from "@/components/post-edit-button";
import { PostBlocks } from "@/components/post-blocks";
import { PostHtmlContent } from "@/components/post-html-content";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { UserProfileLink } from "@/components/user-profile-link";
import { auth } from "@/lib/auth";
import { fetchCommentsForPost, likedCommentIds } from "@/lib/read/comments";
import {
  getLikedPostIds,
  getPublishedPostForPage,
  getPublishedPostMetadata,
} from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";
import { followedUserIds } from "@/lib/read/social-graph";
import { formatPostTimestamp } from "@/lib/format-datetime";
import type { FeedPostBlock } from "@/lib/post-display";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogId } = await params;
  const post = await getPublishedPostMetadata(blogId);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title ?? "Post",
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { blogId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const post = await getPublishedPostForPage(blogId);

  if (!post) {
    notFound();
  }

  const original = post.repostedFrom ?? post;
  const isRepost = Boolean(post.repostedFrom);
  const targetId = original.id;

  const comments = await fetchCommentsForPost(targetId, null);
  const likedIds = session
    ? await likedCommentIds(
        session.user.id,
        comments.map((comment) => comment.id),
      )
    : new Set<string>();

  const commentAuthorIds = [...new Set(comments.map((comment) => comment.user.id))];
  const followedAuthors = session
    ? await followedUserIds(session.user.id, [
        original.ownerId,
        post.ownerId,
        ...commentAuthorIds,
      ])
    : new Set<string>();

  const [likedPostIds, repostedPostIds] = session
    ? await Promise.all([
        getLikedPostIds(session.user.id, [targetId]),
        getRepostedPostIds(session.user.id, [targetId]),
      ])
    : [new Set<string>(), new Set<string>()];

  const commentItems = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    totalLikes: comment.totalLikes,
    likedByUser: likedIds.has(comment.id),
    user: comment.user,
    followedByViewer: followedAuthors.has(comment.user.id),
  }));

  const followsOriginalOwner =
    session && session.user.id !== original.ownerId
      ? followedAuthors.has(original.ownerId)
      : false;

  const htmlContent = (original.blocks as FeedPostBlock[])
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("");

  const videoBlocks = (original.blocks as FeedPostBlock[]).filter(
    (block) => block.format === "VIDEO",
  );

  const canEdit =
    session?.user.id === original.ownerId &&
    !post.repostedFromId &&
    !isRepost;

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
          href="/"
          className="text-sm text-muted link-accent"
        >
          ← Back to posts
        </Link>

        <article className="relative mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {canEdit ? <PostEditButton postId={original.id} /> : null}
          {session?.user.id === post.ownerId ? (
            <PostDeleteButton postId={post.id} redirectTo="/" />
          ) : null}
          {isRepost ? (
            <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {post.owner.name} reposted
            </p>
          ) : null}
          {original.title ? (
            <h1 className="text-2xl font-semibold tracking-tight">
              {original.title}
            </h1>
          ) : null}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{formatPostTimestamp(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <UserProfileLink
              username={original.owner.username}
              displayName={original.owner.name}
              userId={original.ownerId}
              isSignedIn={Boolean(session)}
              viewerId={session?.user.id}
              initialFollowing={followsOriginalOwner}
            />
          </p>
          <PostHtmlContent html={htmlContent} className="post-content mt-4" />
          {videoBlocks.length > 0 ? (
            <PostBlocks blocks={videoBlocks} />
          ) : null}
          <PostActions
            postId={targetId}
            postTitle={original.title}
            commentCount={original._count.comments}
            totalLikes={original.totalLikes}
            totalReposts={original.totalReposts}
            likedByUser={likedPostIds.has(targetId)}
            repostedByUser={repostedPostIds.has(targetId)}
            isOwnPost={session?.user.id === original.ownerId}
            isSignedIn={Boolean(session)}
          />
        </article>

        <CommentEditor blogEntryId={targetId} isSignedIn={Boolean(session)} />
        <CommentsList
          blogId={targetId}
          comments={commentItems}
          isSignedIn={Boolean(session)}
          viewerId={session?.user.id}
        />
      </main>
    </div>
  );
}

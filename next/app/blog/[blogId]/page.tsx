import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentEditor } from "@/components/comment-editor";
import { CommentsList } from "@/components/comments-list";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostBlocks } from "@/components/post-blocks";
import { PostHtmlContent } from "@/components/post-html-content";
import { HeaderNav } from "@/components/header-nav";
import { UserProfileLink } from "@/components/user-profile-link";
import { auth } from "@/lib/auth";
import { fetchCommentsForPost, likedCommentIds } from "@/lib/read/comments";
import {
  getPublishedPostForPage,
  getPublishedPostMetadata,
} from "@/lib/read/posts";
import { followedUserIds } from "@/lib/read/social-graph";
import { formatPostTimestamp } from "@/lib/format-datetime";

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

  const comments = await fetchCommentsForPost(blogId, null);
  const likedIds = session
    ? await likedCommentIds(
        session.user.id,
        comments.map((comment) => comment.id),
      )
    : new Set<string>();

  const commentAuthorIds = [...new Set(comments.map((comment) => comment.user.id))];
  const followedAuthors = session
    ? await followedUserIds(session.user.id, [
        post.ownerId,
        ...commentAuthorIds,
      ])
    : new Set<string>();

  const commentItems = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    totalLikes: comment.totalLikes,
    likedByUser: likedIds.has(comment.id),
    user: comment.user,
    followedByViewer: followedAuthors.has(comment.user.id),
  }));

  const followsPostOwner =
    session && session.user.id !== post.ownerId
      ? followedAuthors.has(post.ownerId)
      : false;

  const htmlContent = post.blocks
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("");

  const videoBlocks = post.blocks.filter((block) => block.format === "VIDEO");

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
            avatarImage={session?.user.image}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href="/"
          className="text-sm text-muted link-accent"
        >
          ← Back to posts
        </Link>

        <article className="relative mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {session?.user.id === post.ownerId ? (
            <PostDeleteButton postId={post.id} redirectTo="/" />
          ) : null}
          {post.title ? (
            <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
          ) : null}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{formatPostTimestamp(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <UserProfileLink
              username={post.owner.name}
              userId={post.ownerId}
              isSignedIn={Boolean(session)}
              viewerId={session?.user.id}
              initialFollowing={followsPostOwner}
            />
          </p>
          <PostHtmlContent html={htmlContent} className="post-content mt-4" />
          {videoBlocks.length > 0 ? (
            <PostBlocks blocks={videoBlocks} />
          ) : null}
        </article>

        <CommentEditor blogEntryId={post.id} isSignedIn={Boolean(session)} />
        <CommentsList
          blogId={post.id}
          comments={commentItems}
          isSignedIn={Boolean(session)}
          viewerId={session?.user.id}
        />
      </main>
    </div>
  );
}

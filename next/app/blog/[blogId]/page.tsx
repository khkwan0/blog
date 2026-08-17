import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentEditor } from "@/components/comment-editor";
import { CommentsList } from "@/components/comments-list";
import { JsonLd } from "@/components/json-ld";
import { PostActions } from "@/components/post-actions";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostEditButton } from "@/components/post-edit-button";
import { PostBlocks } from "@/components/post-blocks";
import { PostDeletedPlaceholder } from "@/components/post-deleted-placeholder";
import { PostHtmlContent } from "@/components/post-html-content";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { PostAuthorHeader } from "@/components/post-author-header";
import { UserIdentityLabels } from "@/components/user-identity-labels";
import { auth } from "@/lib/auth";
import { canDeleteComment } from "@/lib/comment-permissions";
import { fetchAllCommentsForPost, likedCommentIds } from "@/lib/read/comments";
import type { FeedPostBlock } from "@/lib/post-display";
import { getLikedPostIds, getPublishedPostForPage } from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";
import { absoluteUrl, postUrl, userUrl } from "@/lib/site";
import { DELETED_POST_LABEL, isPostDeleted } from "@/lib/posts";
import {
  createPageMetadata,
  extractFirstImageSrc,
  privatePageMetadata,
} from "@/lib/metadata";
import { getPublishedPostSeo } from "@/lib/read/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogId } = await params;
  const post = await getPublishedPostSeo(blogId);

  if (!post) {
    return { title: "Post not found", ...privatePageMetadata };
  }

  if (isPostDeleted(post.status)) {
    return {
      title: DELETED_POST_LABEL,
      ...privatePageMetadata,
    };
  }

  const html = post.blocks.map((block: { content: string }) => block.content).join("");
  const image = extractFirstImageSrc(html);

  return createPageMetadata({
    title: post.title ?? "Post",
    description: post.excerpt ?? undefined,
    path: `/post/${post.id}`,
    image,
    type: "article",
    publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
    modifiedTime: post.modifiedAt.toISOString(),
    authors: [post.owner.name],
  });
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
  const isDeleted = isPostDeleted(original.status);
  const targetId = original.id;

  const comments = await fetchAllCommentsForPost(targetId);
  const likedIds = session
    ? await likedCommentIds(
        session.user.id,
        comments.map((comment) => comment.id),
      )
    : new Set<string>();

  const viewer = session
    ? { id: session.user.id, role: session.user.role }
    : null;

  const [likedPostIds, repostedPostIds] = session
    ? await Promise.all([
        getLikedPostIds(session.user.id, [targetId]),
        getRepostedPostIds(session.user.id, [targetId]),
      ])
    : [new Set<string>(), new Set<string>()];

  const commentItems = comments.map((comment) => ({
    id: comment.id,
    parentId: comment.parentId,
    content: comment.content,
    deletedAt: comment.deletedAt,
    createdAt: comment.createdAt,
    totalLikes: comment.totalLikes,
    likedByUser: likedIds.has(comment.id),
    canDelete: canDeleteComment(
      { userId: comment.user.id, deletedAt: comment.deletedAt },
      viewer,
    ),
    user: comment.user,
  }));

  const htmlContent = (original.blocks as FeedPostBlock[])
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("");

  const videoBlocks = (original.blocks as FeedPostBlock[]).filter(
    (block) => block.format === "VIDEO",
  );

  const canEdit =
    !isDeleted &&
    session?.user.id === original.ownerId &&
    !post.repostedFromId &&
    !isRepost;
  const canDelete =
    !isDeleted && session?.user.id === post.ownerId;

  const publishedAt = original.publishedAt ?? original.createdAt;
  const articleJsonLd = !isDeleted
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: original.title ?? "Post",
        description: original.excerpt ?? undefined,
        datePublished: publishedAt.toISOString(),
        dateModified: original.modifiedAt.toISOString(),
        author: {
          "@type": "Person",
          name: original.owner.name,
          url: userUrl(original.owner.username),
        },
        publisher: {
          "@type": "Organization",
          name: "shitsue",
          url: absoluteUrl("/"),
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl(original.id),
        },
        url: postUrl(original.id),
      }
    : null;

  return (
    <div className="page-shell">
      {articleJsonLd ? <JsonLd data={articleJsonLd} /> : null}
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
          href="/"
          className="text-sm text-muted link-accent"
        >
          ← Back to posts
        </Link>

        <article className="surface-card relative mt-6">
          {canEdit ? <PostEditButton postId={original.id} /> : null}
          {canDelete ? (
            <PostDeleteButton postId={post.id} redirectTo="/" />
          ) : null}
          {isRepost ? (
            <p className="mb-2 flex flex-wrap items-baseline gap-x-1 text-sm text-zinc-500 dark:text-zinc-400">
              <UserIdentityLabels
                displayName={post.owner.name}
                username={post.owner.username}
              />
              <span>reposted</span>
            </p>
          ) : null}
          <PostAuthorHeader
            username={original.owner.username}
            displayName={original.owner.name}
            image={original.owner.image}
            createdAt={post.createdAt}
            className={canEdit || canDelete ? "pr-16" : undefined}
          />
          {isDeleted ? (
            <PostDeletedPlaceholder className="post-content mt-4 text-base not-italic" />
          ) : (
            <>
              {original.title ? (
                <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight">
                  {original.title}
                </h1>
              ) : null}
              <PostHtmlContent html={htmlContent} className="post-content mt-4" />
              {videoBlocks.length > 0 ? (
                <PostBlocks blocks={videoBlocks} />
              ) : null}
            </>
          )}
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
            isDeleted={isDeleted}
          />
        </article>

        <CommentEditor blogEntryId={targetId} isSignedIn={Boolean(session)} />
        <CommentsList
          blogId={targetId}
          comments={commentItems}
          isSignedIn={Boolean(session)}
        />
      </main>
    </div>
  );
}

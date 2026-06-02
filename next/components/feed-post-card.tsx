"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostActions } from "@/components/post-actions";
import { PostAuthorHeader } from "@/components/post-author-header";
import { PostBlocks } from "@/components/post-blocks";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostEditButton } from "@/components/post-edit-button";
import { PostHtmlContent } from "@/components/post-html-content";
import { UserIdentityLabels } from "@/components/user-identity-labels";
import { preparePlainTextLinks } from "@/lib/link-html";
import type { FeedPostView } from "@/lib/post-display";

type FeedPostCardProps = {
  post: FeedPostView;
  isSignedIn: boolean;
  viewerId?: string;
  showOwnerOnRepost?: boolean;
};

export function FeedPostCard({
  post,
  isSignedIn,
  viewerId,
  showOwnerOnRepost = true,
}: FeedPostCardProps) {
  const router = useRouter();
  const author = post.isRepost ? post.targetOwner : post.owner;
  const htmlContent = post.blocks
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("");
  const videoBlocks = post.blocks.filter((block) => block.format === "VIDEO");
  const hasImages = /<img\b/i.test(htmlContent);
  const navigateToPost = () => {
    router.push(post.href);
  };

  return (
    <li
      className="relative cursor-pointer rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      role="link"
      tabIndex={0}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (
          target.closest(
            "a,button,input,textarea,select,details,summary,[role='button']",
          )
        ) {
          return;
        }
        navigateToPost();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigateToPost();
        }
      }}
    >
      {post.canEdit ? <PostEditButton postId={post.targetId} /> : null}
      {post.canDelete ? <PostDeleteButton postId={post.entryId} /> : null}
      <article>
        {post.isRepost && post.reposterDisplayName && post.reposterUsername ? (
          <p className="mb-2 flex flex-wrap items-baseline gap-x-1 text-sm text-zinc-500 dark:text-zinc-400">
            <UserIdentityLabels
              displayName={post.reposterDisplayName}
              username={post.reposterUsername}
            />
            <span>reposted</span>
          </p>
        ) : null}
        {showOwnerOnRepost || !post.isRepost ? (
          <PostAuthorHeader
            username={author.username}
            displayName={author.name}
            image={author.image}
            createdAt={post.createdAt}
          />
        ) : null}
        {post.title ? (
          <Link
            href={post.href}
            className="mt-3 block no-underline text-inherit hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <h3 className="text-lg font-semibold">{post.title}</h3>
          </Link>
        ) : null}
        {post.excerpt && !hasImages ? (
          <p
            className="post-excerpt mt-3 text-zinc-700 dark:text-zinc-300"
            dangerouslySetInnerHTML={{
              __html: preparePlainTextLinks(post.excerpt),
            }}
          />
        ) : null}
        {htmlContent && (hasImages || !post.excerpt) ? (
          <PostHtmlContent html={htmlContent} className="post-content mt-3" />
        ) : null}
        {!post.title && (post.excerpt || hasImages) ? (
          <Link
            href={post.href}
            className="mt-2 inline-block text-sm link-accent"
          >
            Read post
          </Link>
        ) : null}
        <PostBlocks blocks={videoBlocks} />
        <PostActions
          postId={post.targetId}
          postTitle={post.title}
          commentCount={post.commentCount}
          totalLikes={post.totalLikes}
          totalReposts={post.totalReposts}
          likedByUser={post.likedByUser}
          repostedByUser={post.repostedByUser}
          isOwnPost={viewerId === post.targetOwnerId}
          isSignedIn={isSignedIn}
        />
      </article>
    </li>
  );
}

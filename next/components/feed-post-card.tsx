import Link from "next/link";
import { PostActions } from "@/components/post-actions";
import { PostBlocks } from "@/components/post-blocks";
import { PostDeleteButton } from "@/components/post-delete-button";
import { UserProfileLink } from "@/components/user-profile-link";
import { formatPostTimestamp } from "@/lib/format-datetime";
import { displayUsername } from "@/lib/format-username";
import { preparePlainTextLinks } from "@/lib/link-html";
import type { FeedPostView } from "@/lib/post-display";

type FeedPostCardProps = {
  post: FeedPostView;
  isSignedIn: boolean;
  viewerId?: string;
  followedOwnerIds: Set<string>;
  showOwnerOnRepost?: boolean;
};

export function FeedPostCard({
  post,
  isSignedIn,
  viewerId,
  followedOwnerIds,
  showOwnerOnRepost = true,
}: FeedPostCardProps) {
  return (
    <li className="relative rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Link
        href={post.href}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={post.title ? `View post: ${post.title}` : "View post"}
      />
      {post.canDelete ? <PostDeleteButton postId={post.entryId} /> : null}
      <article>
        {post.isRepost && post.reposterName ? (
          <p className="relative z-10 mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {displayUsername(post.reposterName)} reposted
          </p>
        ) : null}
        <div className="relative z-10">
          {post.title ? (
            <h3 className="text-lg font-semibold">{post.title}</h3>
          ) : null}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{formatPostTimestamp(post.createdAt)}</span>
            {showOwnerOnRepost || !post.isRepost ? (
              <>
                <span aria-hidden>·</span>
                <UserProfileLink
                  username={
                    post.isRepost ? post.targetOwner.name : post.owner.name
                  }
                  userId={post.isRepost ? post.targetOwnerId : post.ownerId}
                  isSignedIn={isSignedIn}
                  viewerId={viewerId}
                  initialFollowing={followedOwnerIds.has(
                    post.isRepost ? post.targetOwnerId : post.ownerId,
                  )}
                />
              </>
            ) : null}
          </p>
          {post.excerpt ? (
            <p
              className="post-excerpt mt-3 text-zinc-700 dark:text-zinc-300"
              dangerouslySetInnerHTML={{
                __html: preparePlainTextLinks(post.excerpt),
              }}
            />
          ) : null}
        </div>
        <div className="relative z-10">
          <PostBlocks
            blocks={post.blocks.filter((block) => block.format === "VIDEO")}
          />
        </div>
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

import { headers } from "next/headers";
import Link from "next/link";
import { PostActions } from "@/components/post-actions";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostBlocks } from "@/components/post-blocks";
import { HeaderNav } from "@/components/header-nav";
import { FollowingStrip } from "@/components/following-strip";
import { PostEditor } from "@/components/post-editor";
import { UserProfileLink } from "@/components/user-profile-link";
import { auth } from "@/lib/auth";
import { getFeedPosts, getLikedPostIds } from "@/lib/read/posts";
import {
  followCounts,
  followedUserIds,
  listFollowing,
} from "@/lib/read/social-graph";
import { formatPostTimestamp } from "@/lib/format-datetime";
import { preparePlainTextLinks } from "@/lib/link-html";

export const dynamic = "force-dynamic";

type HomePost = {
  id: string;
  title: string | null;
  slug: string;
  excerpt: string | null;
  totalLikes: number;
  commentCount: number;
  createdAt: Date;
  owner: { name: string };
  ownerId: string;
  likedByUser: boolean;
  blocks: {
    id: string;
    format: "HTML" | "VIDEO" | "TEXT" | "AUDIO" | "MARKDOWN";
    content: string;
    sortOrder: number;
  }[];
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const followingRows = session
    ? await listFollowing(session.user.id)
    : [];
  const followingUsers = followingRows.map((row) => row.following);
  const myCounts = session ? await followCounts(session.user.id) : null;

  const feedOwnerIds = session
    ? [...new Set([session.user.id, ...followingUsers.map((user) => user.id)])]
    : [];

  const posts =
    session && feedOwnerIds.length > 0
      ? await getFeedPosts(feedOwnerIds)
      : [];

  const likedPostIds = session
    ? await getLikedPostIds(
        session.user.id,
        posts.map((post) => post.id),
      )
    : new Set<string>();

  const ownerIds = [...new Set(posts.map((post) => post.ownerId))];
  const followedOwners = session
    ? await followedUserIds(session.user.id, ownerIds)
    : new Set<string>();

  const homePosts: HomePost[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    totalLikes: post.totalLikes,
    commentCount: post._count.comments,
    createdAt: post.createdAt,
    owner: post.owner,
    ownerId: post.ownerId,
    likedByUser: likedPostIds.has(post.id),
    blocks: post.blocks,
  }));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 pr-36">
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {session && myCounts ? (
          <div className="flex items-start gap-8">
            <div className="w-36 shrink-0">
              <FollowingStrip
                profileUsername={session.user.name}
                followerCount={myCounts.followerCount}
                followingCount={myCounts.followingCount}
                users={followingUsers}
              />
            </div>

            <div className="min-w-0 flex-1">
              <PostEditor />

              {homePosts.length === 0 ? (
                <p className="mt-6 text-muted">
                  No posts from you or people you follow yet.
                </p>
              ) : null}

              {homePosts.length > 0 ? (
                <ul className="mt-6 space-y-6">
            {homePosts.map((post) => (
              <li
                key={post.id}
                className="relative rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link
                  href={`/blog/${post.id}`}
                  className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label={
                    post.title ? `View post: ${post.title}` : "View post"
                  }
                />
                {session?.user.id === post.ownerId ? (
                  <PostDeleteButton postId={post.id} />
                ) : null}
                <article>
                  <div className="relative z-10">
                    {post.title ? (
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                    ) : null}
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span>{formatPostTimestamp(post.createdAt)}</span>
                      <span aria-hidden>·</span>
                      <UserProfileLink
                        username={post.owner.name}
                        userId={post.ownerId}
                        isSignedIn={Boolean(session)}
                        viewerId={session?.user.id}
                        initialFollowing={followedOwners.has(post.ownerId)}
                      />
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
                      blocks={post.blocks.filter(
                        (block) => block.format === "VIDEO",
                      )}
                    />
                  </div>
                  <PostActions
                    postId={post.id}
                    postTitle={post.title}
                    commentCount={post.commentCount}
                    totalLikes={post.totalLikes}
                    likedByUser={post.likedByUser}
                    isSignedIn={Boolean(session)}
                  />
                </article>
              </li>
            ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-muted">Sign in to see posts from people you follow.</p>
        )}
      </main>
    </div>
  );
}

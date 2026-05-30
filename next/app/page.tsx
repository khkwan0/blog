import { headers } from "next/headers";
import Link from "next/link";
import { FeedPostCard } from "@/components/feed-post-card";
import { HeaderNav } from "@/components/header-nav";
import { FollowingStrip } from "@/components/following-strip";
import { PostEditor } from "@/components/post-editor";
import { auth } from "@/lib/auth";
import { feedPostTargetIds, toFeedPostView } from "@/lib/post-display";
import { getFeedPosts, getLikedPostIds } from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";
import {
  followCounts,
  followedUserIds,
  listFollowing,
} from "@/lib/read/social-graph";
import { getUserContentStats } from "@/lib/read/user-stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const followingRows = session
    ? await listFollowing(session.user.id)
    : [];
  const followingUsers = followingRows.map((row) => row.following);
  const myCounts = session ? await followCounts(session.user.id) : null;
  const contentStats = session
    ? await getUserContentStats(session.user.id)
    : null;

  const feedOwnerIds = session
    ? [...new Set([session.user.id, ...followingUsers.map((user) => user.id)])]
    : [];

  const posts =
    session && feedOwnerIds.length > 0
      ? await getFeedPosts(feedOwnerIds)
      : [];

  const targetIds = feedPostTargetIds(posts);

  const [likedPostIds, repostedPostIds] = session
    ? await Promise.all([
        getLikedPostIds(session.user.id, targetIds),
        getRepostedPostIds(session.user.id, targetIds),
      ])
    : [new Set<string>(), new Set<string>()];

  const ownerIds = [
    ...new Set(
      posts.flatMap((post) => {
        const original = post.repostedFrom ?? post;
        return [post.ownerId, original.ownerId];
      }),
    ),
  ];
  const followedOwners = session
    ? await followedUserIds(session.user.id, ownerIds)
    : new Set<string>();

  const feedPosts = posts.map((post) =>
    toFeedPostView(post, {
      viewerId: session?.user.id,
      likedPostIds,
      repostedPostIds,
    }),
  );

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
        {session && myCounts && contentStats ? (
          <div className="flex items-start gap-8">
            <div className="w-40 shrink-0">
              <FollowingStrip
                profileUsername={session.user.name}
                followerCount={myCounts.followerCount}
                followingCount={myCounts.followingCount}
                contentStats={contentStats}
                users={followingUsers}
              />
            </div>

            <div className="min-w-0 flex-1">
              <PostEditor />

              {feedPosts.length === 0 ? (
                <p className="mt-6 text-muted">
                  No posts from you or people you follow yet.
                </p>
              ) : null}

              {feedPosts.length > 0 ? (
                <ul className="mt-6 space-y-6">
                  {feedPosts.map((post) => (
                    <FeedPostCard
                      key={post.entryId}
                      post={post}
                      isSignedIn={Boolean(session)}
                      viewerId={session.user.id}
                      followedOwnerIds={followedOwners}
                    />
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

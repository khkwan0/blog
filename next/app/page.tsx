import type { Metadata } from "next";
import { headers } from "next/headers";
import { FeedPostCard } from "@/components/feed-post-card";
import { SiteHeader } from "@/components/site-header";
import { HeaderNav } from "@/components/header-nav";
import { FollowingStrip } from "@/components/following-strip";
import { PostEditor } from "@/components/post-editor";
import { auth } from "@/lib/auth";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { feedPostTargetIds, toFeedPostView } from "@/lib/post-display";
import { getFeedPosts, getLatestPosts, getLikedPostIds } from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";
import {
  followCounts,
  listFollowing,
} from "@/lib/read/social-graph";
import { getUserContentStats } from "@/lib/read/user-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

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

  const posts = session
    ? feedOwnerIds.length > 0
      ? await getFeedPosts(feedOwnerIds)
      : []
    : await getLatestPosts();

  const targetIds = feedPostTargetIds(posts);

  const [likedPostIds, repostedPostIds] = session
    ? await Promise.all([
        getLikedPostIds(session.user.id, targetIds),
        getRepostedPostIds(session.user.id, targetIds),
      ])
    : [new Set<string>(), new Set<string>()];

  const feedPosts = posts.map((post) =>
    toFeedPostView(post, {
      viewerId: session?.user.id,
      likedPostIds,
      repostedPostIds,
    }),
  );

  const feedList =
    feedPosts.length === 0 ? (
      <p className="text-muted">
        {session
          ? "No posts from you or people you follow yet."
          : "No posts yet."}
      </p>
    ) : (
      <ul className="space-y-4 sm:space-y-6">
        {feedPosts.map((post) => (
          <FeedPostCard
            key={post.entryId}
            post={post}
            isSignedIn={Boolean(session)}
            viewerId={session?.user.id}
          />
        ))}
      </ul>
    );

  return (
    <div className="page-shell">
      <SiteHeader maxWidthClass="max-w-5xl">
        <HeaderNav
          isSignedIn={Boolean(session)}
          username={session?.user.username ?? null}
          displayName={session?.user.name ?? null}
          avatarImage={session?.user.image}
        />
      </SiteHeader>

      <main className="page-main max-w-5xl">
        {session && myCounts && contentStats ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:gap-y-6">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <PostEditor
                displayName={session.user.name}
                avatarImage={session.user.image}
              />
            </div>

            <div className="w-full lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-40">
              <FollowingStrip
                profileUsername={session.user.username ?? ""}
                followerCount={myCounts.followerCount}
                followingCount={myCounts.followingCount}
                contentStats={contentStats}
              />
            </div>

            <div className="min-w-0 lg:col-start-2 lg:row-start-2">
              {feedList}
            </div>
          </div>
        ) : (
          feedList
        )}
      </main>
    </div>
  );
}

import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow-button";
import { FeedPostCard } from "@/components/feed-post-card";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { UserAvatar } from "@/components/user-avatar";
import { UserIdentityLabels } from "@/components/user-identity-labels";
import { auth } from "@/lib/auth";
import { feedPostTargetIds, toFeedPostView } from "@/lib/post-display";
import { getLikedPostIds, getPostsByOwner } from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";
import {
  followCounts,
  isFollowing,
} from "@/lib/read/social-graph";
import { getUserContentStats } from "@/lib/read/user-stats";
import { findUserByUsername } from "@/lib/read/users";
import { formatDate } from "@/lib/format-datetime";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim().toLowerCase();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const profile = await findUserByUsername(username);

  if (!profile) {
    notFound();
  }

  const [counts, posts, contentStats] = await Promise.all([
    followCounts(profile.id),
    getPostsByOwner(profile.id),
    getUserContentStats(profile.id),
  ]);

  const isSelf = session?.user.id === profile.id;
  const viewerFollows =
    session && !isSelf
      ? await isFollowing(session.user.id, profile.id)
      : false;

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
        <Link href="/" className="text-sm text-muted link-accent">
          ← Back to posts
        </Link>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <UserAvatar
                name={profile.name}
                image={profile.image}
                size="lg"
              />
              {!isSelf ? (
                <FollowButton
                  username={profile.username}
                  initialFollowing={viewerFollows}
                  isSignedIn={Boolean(session)}
                  isSelf={isSelf}
                  size="md"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <UserIdentityLabels
                displayName={profile.name}
                username={profile.username}
                className="[&>span:first-child]:text-2xl [&>span:first-child]:font-semibold [&>span:first-child]:tracking-tight [&>span:last-child]:text-sm"
              />
              <p className="mt-2 text-sm text-muted">
                Joined {formatDate(profile.createdAt)}
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">{counts.followerCount}</span>{" "}
                followers
                {" · "}
                <span className="font-medium">{counts.followingCount}</span>{" "}
                following
                {" · "}
                <span className="font-medium">{contentStats.postCount}</span>{" "}
                posts
                {" · "}
                <span className="font-medium">{contentStats.totalLikes}</span>{" "}
                likes
                {" · "}
                <span className="font-medium">{contentStats.totalReposts}</span>{" "}
                reposts
                {" · "}
                <span className="font-medium">{contentStats.totalComments}</span>{" "}
                comments
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Posts</h2>
          {feedPosts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No published posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-6">
              {feedPosts.map((post) => (
                <FeedPostCard
                  key={post.entryId}
                  post={post}
                  isSignedIn={Boolean(session)}
                  viewerId={session?.user.id}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

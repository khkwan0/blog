import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow-button";
import { HeaderNav } from "@/components/header-nav";
import { PostActions } from "@/components/post-actions";
import { PostBlocks } from "@/components/post-blocks";
import { UserAvatar } from "@/components/user-avatar";
import { auth } from "@/lib/auth";
import { preparePlainTextLinks } from "@/lib/link-html";
import { getLikedPostIds, getPostsByOwner } from "@/lib/read/posts";
import {
  followCounts,
  followedUserIds,
  isFollowing,
  listFollowers,
  listFollowing,
} from "@/lib/read/social-graph";
import { findUserByUsername } from "@/lib/read/users";
import { formatDate, formatPostTimestamp } from "@/lib/format-datetime";
import { displayUsername } from "@/lib/format-username";

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

  const [counts, posts, followerRows, followingRows] = await Promise.all([
    followCounts(profile.id),
    getPostsByOwner(profile.id),
    listFollowers(profile.id),
    listFollowing(profile.id),
  ]);

  const isSelf = session?.user.id === profile.id;
  const viewerFollows =
    session && !isSelf
      ? await isFollowing(session.user.id, profile.id)
      : false;

  const likedPostIds = session
    ? await getLikedPostIds(
        session.user.id,
        posts.map((post) => post.id),
      )
    : new Set<string>();

  const relatedUserIds = [
    ...followerRows.map((row) => row.follower.id),
    ...followingRows.map((row) => row.following.id),
  ];
  const followedRelated = session
    ? await followedUserIds(session.user.id, relatedUserIds)
    : new Set<string>();

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
        <Link href="/" className="text-sm text-muted link-accent">
          ← Back to posts
        </Link>

        <section className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {displayUsername(profile.name)}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Joined {formatDate(profile.createdAt)}
            </p>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">{counts.followerCount}</span> followers
              {" · "}
              <span className="font-medium">{counts.followingCount}</span> following
            </p>
            <div className="mt-4">
              <FollowButton
                username={profile.name}
                initialFollowing={viewerFollows}
                isSignedIn={Boolean(session)}
                isSelf={isSelf}
                size="md"
              />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Followers</h2>
            {followerRows.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No followers yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {followerRows.map((row) => (
                  <li
                    key={row.follower.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <Link
                      href={`/user/${encodeURIComponent(row.follower.name)}`}
                      className="link-accent"
                    >
                      {displayUsername(row.follower.name)}
                    </Link>
                    {session && session.user.id !== row.follower.id ? (
                      <FollowButton
                        username={row.follower.name}
                        initialFollowing={followedRelated.has(row.follower.id)}
                        isSignedIn
                        isSelf={false}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">Following</h2>
            {followingRows.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Not following anyone yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {followingRows.map((row) => (
                  <li
                    key={row.following.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <Link
                      href={`/user/${encodeURIComponent(row.following.name)}`}
                      className="link-accent"
                    >
                      {displayUsername(row.following.name)}
                    </Link>
                    {session && session.user.id !== row.following.id ? (
                      <FollowButton
                        username={row.following.name}
                        initialFollowing={followedRelated.has(row.following.id)}
                        isSignedIn
                        isSelf={false}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Posts</h2>
          {posts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No published posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-6">
              {posts.map((post) => (
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
                  <article>
                    <div className="relative z-10">
                      {post.title ? (
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                      ) : null}
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {formatPostTimestamp(post.createdAt)}
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
                      commentCount={post._count.comments}
                      totalLikes={post.totalLikes}
                      likedByUser={likedPostIds.has(post.id)}
                      isSignedIn={Boolean(session)}
                    />
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

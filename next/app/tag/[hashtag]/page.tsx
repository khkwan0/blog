import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedPostCard } from "@/components/feed-post-card";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";
import { feedPostTargetIds, toFeedPostView } from "@/lib/post-display";
import { getLikedPostIds, getPostsByHashtag } from "@/lib/read/posts";
import { getRepostedPostIds } from "@/lib/read/reposts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ hashtag: string }>;
};

export default async function HashtagPage({ params }: PageProps) {
  const { hashtag: rawHashtag } = await params;
  const hashtag = decodeURIComponent(rawHashtag).trim().toLowerCase();

  if (!hashtag) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const posts = await getPostsByHashtag(hashtag);
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

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          <span className="text-violet-700 dark:text-violet-400">#{hashtag}</span>
        </h1>

        {feedPosts.length === 0 ? (
          <p className="mt-6 text-muted">No posts with this hashtag yet.</p>
        ) : (
          <ul className="mt-6 space-y-6">
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
      </main>
    </div>
  );
}

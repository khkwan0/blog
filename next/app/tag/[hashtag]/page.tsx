import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderNav } from "@/components/header-nav";
import { PostActions } from "@/components/post-actions";
import { PostBlocks } from "@/components/post-blocks";
import { UserProfileLink } from "@/components/user-profile-link";
import { auth } from "@/lib/auth";
import { formatPostTimestamp } from "@/lib/format-datetime";
import { preparePlainTextLinks } from "@/lib/link-html";
import { getLikedPostIds, getPostsByHashtag } from "@/lib/read/posts";
import { followedUserIds } from "@/lib/read/social-graph";

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

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          <span className="text-violet-700 dark:text-violet-400">#{hashtag}</span>
        </h1>

        {posts.length === 0 ? (
          <p className="mt-6 text-muted">No posts with this hashtag yet.</p>
        ) : (
          <ul className="mt-6 space-y-6">
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
                      <h2 className="text-lg font-semibold">{post.title}</h2>
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
      </main>
    </div>
  );
}

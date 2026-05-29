import { headers } from "next/headers";
import Link from "next/link";
import { PostActions } from "@/components/post-actions";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostBlocks } from "@/components/post-blocks";
import { HeaderNav } from "@/components/header-nav";
import { PostEditor } from "@/components/post-editor";
import { auth } from "@/lib/auth";
import { preparePlainTextLinks } from "@/lib/link-html";
import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HomePost = {
  id: string;
  title: string | null;
  slug: string;
  excerpt: string | null;
  totalLikes: number;
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const posts = await prisma.blogEntry.findMany({
    where: publicPostWhere,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      totalLikes: true,
      createdAt: true,
      owner: {
        select: {
          name: true,
        },
      },
      ownerId: true,
      blocks: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          format: true,
          content: true,
          sortOrder: true,
        },
      },
    },
  });

  const likedPostIds = new Set<string>();
  if (session && posts.length > 0) {
    const likes = await prisma.blogEntryLike.findMany({
      where: {
        userId: session.user.id,
        blogEntryId: { in: posts.map((post) => post.id) },
      },
      select: { blogEntryId: true },
    });

    for (const like of likes) {
      likedPostIds.add(like.blogEntryId);
    }
  }

  const homePosts: HomePost[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    totalLikes: post.totalLikes,
    createdAt: post.createdAt,
    owner: post.owner,
    ownerId: post.ownerId,
    likedByUser: likedPostIds.has(post.id),
    blocks: post.blocks,
  }));

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
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {session ? <PostEditor /> : null}

        <h2 className="text-2xl font-semibold tracking-tight">Posts</h2>

        {homePosts.length === 0 ? (
          <p className="mt-6 text-muted">No published posts yet.</p>
        ) : (
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
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(post.createdAt)}
                      {` · ${post.owner.name}`}
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
                    totalLikes={post.totalLikes}
                    likedByUser={post.likedByUser}
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

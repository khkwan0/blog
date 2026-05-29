import { headers } from "next/headers";
import { HeaderNav } from "@/components/header-nav";
import { PostEditor } from "@/components/post-editor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HomePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date;
  owner: { name: string };
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

  const posts: HomePost[] = await prisma.blogEntry.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4 pr-36">
          <h1 className="text-xl font-semibold tracking-tight">blog.kkith.com</h1>
          <HeaderNav
            isSignedIn={Boolean(session)}
            username={session?.user.name ?? null}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {session ? <PostEditor /> : null}

        <h2 className="text-2xl font-semibold tracking-tight">Posts</h2>

        {posts.length === 0 ? (
          <p className="mt-6 text-muted">No published posts yet.</p>
        ) : (
          <ul className="mt-6 space-y-6">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <article>
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(post.createdAt)}
                    {` · ${post.owner.name}`}
                  </p>
                  {post.excerpt ? (
                    <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                      {post.excerpt}
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

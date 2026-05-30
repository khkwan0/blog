import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderNav } from "@/components/header-nav";
import { auth } from "@/lib/auth";
import { displayUsername } from "@/lib/format-username";
import { listFollowingAlphabetical } from "@/lib/read/social-graph";
import { findUserByUsername } from "@/lib/read/users";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserFollowingPage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim().toLowerCase();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const profile = await findUserByUsername(username);

  if (!profile) {
    notFound();
  }

  const followingRows = await listFollowingAlphabetical(profile.id);
  const profileHref = `/user/${encodeURIComponent(profile.name)}`;

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
        <Link href={profileHref} className="text-sm text-muted link-accent">
          ← Back to {displayUsername(profile.name)}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {displayUsername(profile.name)} following
        </h1>

        {followingRows.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Not following anyone yet.</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {followingRows.map((row) => (
              <li key={row.following.id}>
                <Link
                  href={`/user/${encodeURIComponent(row.following.name)}`}
                  className="link-accent text-sm font-medium"
                >
                  {displayUsername(row.following.name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

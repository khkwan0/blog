import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";
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
  const profileHref = `/user/${encodeURIComponent(profile.username)}`;

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
        <Link href={profileHref} className="text-sm text-muted link-accent">
          ← Back to {profile.name}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {profile.name} following
        </h1>

        {followingRows.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Not following anyone yet.</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {followingRows.map((row) => (
              <li key={row.following.id}>
                <Link
                  href={`/user/${encodeURIComponent(row.following.username)}`}
                  className="link-accent text-sm font-medium"
                >
                  {row.following.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

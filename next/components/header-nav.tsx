"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { UserIdentityLabels } from "@/components/user-identity-labels";
import { authClient } from "@/lib/auth-client";

type HeaderNavProps = {
  isSignedIn: boolean;
  username: string | null;
  displayName?: string | null;
  avatarImage?: string | null;
};

export function HeaderNav({
  isSignedIn,
  username,
  displayName,
  avatarImage,
}: HeaderNavProps) {
  const router = useRouter();

  const onSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  if (!isSignedIn) {
    return (
      <nav className="flex shrink-0 gap-3 text-sm">
        <Link href="/auth/login" className="link-accent">
          Sign in
        </Link>
        <Link href="/auth/register" className="text-muted hover:underline">
          Register
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/settings"
          className="shrink-0 text-muted hover:text-foreground"
          title="Account settings"
        >
          <UserAvatar
            name={displayName ?? username ?? "?"}
            image={avatarImage}
            size="sm"
          />
        </Link>
        {username ? (
          <Link
            href={`/user/${encodeURIComponent(username)}`}
            className="min-w-0 text-muted no-underline hover:text-foreground hover:underline"
            title="Your profile"
          >
            <UserIdentityLabels
              displayName={displayName ?? username}
              username={username}
            />
          </Link>
        ) : (
          <span>…</span>
        )}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="link-accent shrink-0"
      >
        Sign out
      </button>
    </nav>
  );
}

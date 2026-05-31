"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { displayUsername } from "@/lib/format-username";

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
      <nav className="flex gap-3 text-sm">
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
    <nav className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="text-muted hover:text-foreground"
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
            className="text-muted hover:text-foreground"
            title="Your profile"
          >
            {displayName ?? displayUsername(username)}
          </Link>
        ) : (
          <span>…</span>
        )}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="link-accent"
      >
        Sign out
      </button>
    </nav>
  );
}

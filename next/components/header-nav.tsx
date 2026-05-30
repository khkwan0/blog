"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { displayUsername } from "@/lib/format-username";

type HeaderNavProps = {
  isSignedIn: boolean;
  username: string | null;
  avatarImage?: string | null;
};

export function HeaderNav({
  isSignedIn,
  username,
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
      <Link
        href="/settings"
        className="flex items-center gap-2 text-muted hover:text-foreground"
        title="Account settings"
      >
        <UserAvatar
          name={username ?? "?"}
          image={avatarImage}
          size="sm"
        />
        <span>{username ? displayUsername(username) : "…"}</span>
      </Link>
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

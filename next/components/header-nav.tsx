"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type HeaderNavProps = {
  isSignedIn: boolean;
  username: string | null;
};

export function HeaderNav({ isSignedIn, username }: HeaderNavProps) {
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
      <span className="text-muted">
        Signed in as {username ?? "…"}
      </span>
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

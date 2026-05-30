"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowButtonProps = {
  username: string;
  initialFollowing: boolean;
  isSignedIn: boolean;
  isSelf: boolean;
  size?: "sm" | "md";
};

export function FollowButton({
  username,
  initialFollowing,
  isSignedIn,
  isSelf,
  size = "sm",
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isSelf) {
    return null;
  }

  const sizeClass =
    size === "md"
      ? "px-4 py-2 text-sm"
      : "px-2.5 py-1 text-xs";

  if (!isSignedIn) {
    return (
      <Link
        href="/auth/login"
        onClick={(event) => event.stopPropagation()}
        className={`${sizeClass} relative z-10 rounded-md border border-zinc-300 font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-200`}
      >
        Follow
      </Link>
    );
  }

  const onToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setLoading(true);

    const response = await fetch(
      `/api/users/${encodeURIComponent(username)}/follow`,
      {
        method: following ? "DELETE" : "POST",
        credentials: "include",
      },
    );

    setLoading(false);

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { following: boolean };
    setFollowing(data.following);
    router.refresh();
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onToggle}
      className={`${sizeClass} relative z-10 rounded-md font-medium disabled:opacity-60 ${
        following
          ? "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
          : "bg-emerald-600 text-white"
      }`}
    >
      {loading ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}

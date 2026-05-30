"use client";

import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { displayUsername } from "@/lib/format-username";

type UserProfileLinkProps = {
  username: string;
  userId: string;
  isSignedIn: boolean;
  viewerId?: string | null;
  initialFollowing?: boolean;
  showFollow?: boolean;
};

export function UserProfileLink({
  username,
  userId,
  isSignedIn,
  viewerId,
  initialFollowing = false,
  showFollow = true,
}: UserProfileLinkProps) {
  const isSelf = viewerId === userId;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Link
        href={`/user/${encodeURIComponent(username)}`}
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 link-accent"
      >
        {displayUsername(username)}
      </Link>
      {showFollow ? (
        <FollowButton
          username={username}
          initialFollowing={initialFollowing}
          isSignedIn={isSignedIn}
          isSelf={isSelf}
        />
      ) : null}
    </span>
  );
}

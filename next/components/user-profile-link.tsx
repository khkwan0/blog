"use client";

import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { UserIdentityLabels } from "@/components/user-identity-labels";

type UserProfileLinkProps = {
  username: string;
  displayName: string;
  userId: string;
  isSignedIn: boolean;
  viewerId?: string | null;
  initialFollowing?: boolean;
  showFollow?: boolean;
};

export function UserProfileLink({
  username,
  displayName,
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
        className="relative z-10 no-underline hover:underline"
      >
        <UserIdentityLabels displayName={displayName} username={username} />
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

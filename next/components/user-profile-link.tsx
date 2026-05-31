"use client";

import Link from "next/link";
import { UserIdentityLabels } from "@/components/user-identity-labels";

type UserProfileLinkProps = {
  username: string;
  displayName: string;
};

export function UserProfileLink({ username, displayName }: UserProfileLinkProps) {
  return (
    <Link
      href={`/user/${encodeURIComponent(username)}`}
      onClick={(event) => event.stopPropagation()}
      className="relative z-10 no-underline hover:underline"
    >
      <UserIdentityLabels displayName={displayName} username={username} />
    </Link>
  );
}

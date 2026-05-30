import Link from "next/link";
import { displayUsername } from "@/lib/format-username";

export type FollowingPreviewUser = {
  id: string;
  name: string;
};

type FollowingPreviewProps = {
  profileUsername: string;
  users: FollowingPreviewUser[];
};

export function FollowingPreview({
  profileUsername,
  users,
}: FollowingPreviewProps) {
  const followingHref = `/user/${encodeURIComponent(profileUsername)}/following`;

  if (users.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Following</h2>
        <p className="mt-3 text-sm text-muted">Not following anyone yet.</p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">Following</h2>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 overflow-hidden max-h-[3.75rem]">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/user/${encodeURIComponent(user.name)}`}
            className="link-accent text-sm font-medium whitespace-nowrap"
          >
            {displayUsername(user.name)}
          </Link>
        ))}
      </div>
      <Link
        href={followingHref}
        className="mt-3 inline-block text-sm font-medium link-accent"
      >
        See More
      </Link>
    </section>
  );
}

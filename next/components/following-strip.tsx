import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { displayUsername } from "@/lib/format-username";

export type FollowingUser = {
  id: string;
  name: string;
  image: string | null;
};

type FollowingStripProps = {
  profileUsername: string;
  followerCount: number;
  followingCount: number;
  users: FollowingUser[];
};

export function FollowingStrip({
  profileUsername,
  followerCount,
  followingCount,
  users,
}: FollowingStripProps) {
  const profileHref = `/user/${encodeURIComponent(profileUsername)}`;

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4">
        <Link href={profileHref} className="flex flex-col link-accent">
          <span className="text-2xl font-semibold tabular-nums">
            {followerCount}
          </span>
          <span className="text-sm text-muted">followers</span>
        </Link>
        <Link href={profileHref} className="flex flex-col link-accent">
          <span className="text-2xl font-semibold tabular-nums">
            {followingCount}
          </span>
          <span className="text-sm text-muted">following</span>
        </Link>
      </div>

      {users.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/user/${encodeURIComponent(user.name)}`}
                className="flex items-center gap-2 rounded-lg py-1 no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={displayUsername(user.name)}
              >
                <UserAvatar name={user.name} image={user.image} size="sm" />
                <span className="truncate text-sm font-medium">
                  {displayUsername(user.name)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

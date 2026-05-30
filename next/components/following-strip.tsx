import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { displayUsername } from "@/lib/format-username";

export type FollowingUser = {
  id: string;
  name: string;
  image: string | null;
};

export type SidebarStats = {
  postCount: number;
  totalLikes: number;
  totalReposts: number;
  totalComments: number;
};

type FollowingStripProps = {
  profileUsername: string;
  followerCount: number;
  followingCount: number;
  contentStats: SidebarStats;
  users: FollowingUser[];
};

function StatLink({
  href,
  value,
  label,
}: {
  href: string;
  value: number;
  label: string;
}) {
  return (
    <Link href={href} className="flex flex-col link-accent">
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </Link>
  );
}

export function FollowingStrip({
  profileUsername,
  followerCount,
  followingCount,
  contentStats,
  users,
}: FollowingStripProps) {
  const profileHref = `/user/${encodeURIComponent(profileUsername)}`;

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4">
        <StatLink
          href={profileHref}
          value={followerCount}
          label="followers"
        />
        <StatLink
          href={profileHref}
          value={followingCount}
          label="following"
        />
        <StatLink
          href={profileHref}
          value={contentStats.postCount}
          label="posts"
        />
        <StatLink
          href={profileHref}
          value={contentStats.totalLikes}
          label="likes received"
        />
        <StatLink
          href={profileHref}
          value={contentStats.totalReposts}
          label="reposts received"
        />
        <StatLink
          href={profileHref}
          value={contentStats.totalComments}
          label="comments & replies"
        />
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

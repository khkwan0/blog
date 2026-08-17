import Link from "next/link";

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
      <span className="text-xl font-semibold tabular-nums lg:text-2xl">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </Link>
  );
}

export function FollowingStrip({
  profileUsername,
  followerCount,
  followingCount,
  contentStats,
}: FollowingStripProps) {
  const profileHref = `/user/${encodeURIComponent(profileUsername)}`;

  return (
    <aside className="surface-card">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:flex lg:flex-col">
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
    </aside>
  );
}

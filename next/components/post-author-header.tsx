import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { UserIdentityLabels } from "@/components/user-identity-labels";
import { formatRelativeTime } from "@/lib/format-datetime";

type PostAuthorHeaderProps = {
  username: string;
  displayName: string;
  image?: string | null;
  createdAt: Date;
  className?: string;
};

export function PostAuthorHeader({
  username,
  displayName,
  image,
  createdAt,
  className = "",
}: PostAuthorHeaderProps) {
  const profileHref = `/user/${encodeURIComponent(username)}`;

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <Link
        href={profileHref}
        className="shrink-0 no-underline hover:underline"
      >
        <UserAvatar name={displayName} image={image} size="sm" />
      </Link>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
        <Link href={profileHref} className="min-w-0 no-underline hover:underline">
          <UserIdentityLabels displayName={displayName} username={username} />
        </Link>
        <span
          aria-hidden
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          ·
        </span>
        <time
          dateTime={createdAt.toISOString()}
          className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {formatRelativeTime(createdAt)}
        </time>
      </div>
    </div>
  );
}

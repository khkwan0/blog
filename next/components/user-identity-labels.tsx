import { displayUsername } from "@/lib/format-username";

type UserIdentityLabelsProps = {
  displayName: string;
  username: string;
  className?: string;
};

export function UserIdentityLabels({
  displayName,
  username,
  className = "",
}: UserIdentityLabelsProps) {
  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {displayName}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {displayUsername(username)}
      </span>
    </span>
  );
}

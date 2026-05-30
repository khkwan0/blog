type UserAvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-12 text-sm",
  lg: "size-24 text-2xl",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const initials = name.trim().charAt(0).toUpperCase() || "?";
  const sizeClass = sizeClasses[size];

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100 ${className}`}
    >
      {initials}
    </span>
  );
}

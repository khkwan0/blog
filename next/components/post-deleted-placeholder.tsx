import { DELETED_POST_LABEL } from "@/lib/posts";

type PostDeletedPlaceholderProps = {
  className?: string;
};

export function PostDeletedPlaceholder({ className }: PostDeletedPlaceholderProps) {
  return (
    <p
      className={
        className ??
        "mt-3 text-sm italic text-zinc-500 dark:text-zinc-400"
      }
    >
      {DELETED_POST_LABEL}
    </p>
  );
}

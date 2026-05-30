"use client";

import Link from "next/link";
import { MouseEvent } from "react";

type PostEditButtonProps = {
  postId: string;
};

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function PostEditButtonInner({ postId }: PostEditButtonProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <Link
      href={`/blog/${postId}/edit`}
      onClick={onClick}
      aria-label="Edit post"
      title="Edit post"
      className="absolute top-4 right-14 z-20 rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      <PencilIcon />
    </Link>
  );
}

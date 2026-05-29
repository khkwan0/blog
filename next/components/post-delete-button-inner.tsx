"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import { DELETE_SECTION } from "@/lib/api-section";

type PostDeleteButtonProps = {
  postId: string;
  redirectTo?: string;
};

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function PostDeleteButtonInner({
  postId,
  redirectTo,
}: PostDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/posts/${postId}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: DELETE_SECTION }),
    });

    setLoading(false);

    if (!response.ok) {
      alert("Could not delete this post.");
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    router.refresh();
  };

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void onDelete();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Delete post"
      title="Delete post"
      className="absolute top-4 right-4 z-20 rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      <TrashIcon />
    </button>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CommentActionsInnerProps = {
  blogId: string;
  commentId: string;
  totalLikes: number;
  likedByUser: boolean;
  isSignedIn: boolean;
};

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ThumbsUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

const actionClass =
  "rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-emerald-400";

export function CommentActionsInner({
  blogId,
  commentId,
  totalLikes: initialTotalLikes,
  likedByUser: initialLiked,
  isSignedIn,
}: CommentActionsInnerProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const onLike = async () => {
    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    const response = await fetch(
      `/api/posts/${blogId}/comments/${commentId}/like`,
      { method: "POST" },
    );

    setLoading(false);

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as {
      liked: boolean;
      totalLikes: number;
    };

    setLiked(data.liked);
    setTotalLikes(data.totalLikes);
  };

  const onShare = async () => {
    const url = `${window.location.origin}/blog/${blogId}/comment/${commentId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "shitsue",
          url,
        });
        setShared(true);
        return;
      }

      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      // User cancelled share or clipboard denied.
    }
  };

  return (
    <div className="mt-3 flex items-center gap-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <Link
        href={`/blog/${blogId}/comment/${commentId}`}
        className={actionClass}
        aria-label="Reply to comment"
        title="Reply"
      >
        <ChatIcon />
      </Link>

      <button
        type="button"
        onClick={() => void onLike()}
        disabled={loading}
        className={`${actionClass} flex items-center gap-1.5 disabled:opacity-50${
          liked ? " text-emerald-700 dark:text-emerald-400" : ""
        }`}
        aria-label={liked ? "Unlike comment" : "Like comment"}
        title={liked ? "Unlike" : "Like"}
      >
        <ThumbsUpIcon filled={liked} />
        <span className="text-sm tabular-nums">{totalLikes}</span>
      </button>

      <button
        type="button"
        onClick={() => void onShare()}
        className={`${actionClass}${shared ? " text-emerald-700 dark:text-emerald-400" : ""}`}
        aria-label="Share comment"
        title={shared ? "Link shared" : "Share"}
      >
        <ShareIcon />
      </button>
    </div>
  );
}

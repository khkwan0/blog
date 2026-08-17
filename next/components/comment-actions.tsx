"use client";

import dynamic from "next/dynamic";

const CommentActionsInner = dynamic(
  () =>
    import("@/components/comment-actions-inner").then(
      (module) => module.CommentActionsInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="mt-3 h-10 border-t border-zinc-200 pt-3 dark:border-zinc-800"
        aria-hidden="true"
      />
    ),
  },
);

type CommentActionsProps = {
  blogId: string;
  commentId: string;
  totalLikes: number;
  likedByUser: boolean;
  isSignedIn: boolean;
  isDeleted?: boolean;
  canDelete?: boolean;
  replyOpen?: boolean;
  onReply?: () => void;
};

export function CommentActions(props: CommentActionsProps) {
  return <CommentActionsInner {...props} />;
}

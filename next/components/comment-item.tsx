"use client";

import { useState } from "react";
import { CommentActions } from "@/components/comment-actions";
import { CommentEditor } from "@/components/comment-editor";
import { UserProfileLink } from "@/components/user-profile-link";
import type { CommentListItem } from "@/components/comments-list";
import { DELETED_COMMENT_LABEL } from "@/lib/comments";
import { formatRelativeTime } from "@/lib/format-datetime";
import { prepareHtmlLinks } from "@/lib/link-html";

type CommentItemProps = {
  blogId: string;
  comment: CommentListItem;
  isSignedIn: boolean;
  as?: "li" | "div";
  className?: string;
};

export function CommentItem({
  blogId,
  comment,
  isSignedIn,
  as: Component = "li",
  className,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const isDeleted = comment.deletedAt !== null;
  const isReply = comment.parentId !== null;

  const baseClass = "surface-card min-w-0";
  const indentClass = isReply ? " ml-4 sm:ml-8" : "";
  const itemClassName = className ?? `${baseClass}${indentClass}`;

  const onReply = () => {
    setReplyOpen((open) => !open);
  };

  return (
    <Component className={itemClassName}>
      <p className="flex flex-wrap items-start gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <UserProfileLink
          username={comment.user.username}
          displayName={comment.user.name}
        />
        <span aria-hidden>·</span>
        <span>{formatRelativeTime(comment.createdAt)}</span>
      </p>
      {isDeleted ? (
        <p className="mt-2 text-sm italic text-zinc-500 dark:text-zinc-400">
          {DELETED_COMMENT_LABEL}
        </p>
      ) : (
        <div
          className="post-content mt-2"
          dangerouslySetInnerHTML={{
            __html: prepareHtmlLinks(comment.content),
          }}
        />
      )}
      <CommentActions
        blogId={blogId}
        commentId={comment.id}
        totalLikes={comment.totalLikes}
        likedByUser={comment.likedByUser}
        isSignedIn={isSignedIn}
        isDeleted={isDeleted}
        canDelete={comment.canDelete}
        replyOpen={replyOpen}
        onReply={onReply}
      />
      {replyOpen && !isDeleted ? (
        <CommentEditor
          key={comment.id}
          blogEntryId={blogId}
          parentId={comment.id}
          isSignedIn={isSignedIn}
          variant="inline"
          heading="Reply"
          submitLabel="Post reply"
          onCancel={() => setReplyOpen(false)}
          onPosted={() => setReplyOpen(false)}
        />
      ) : null}
    </Component>
  );
}

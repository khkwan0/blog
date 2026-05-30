import { CommentActions } from "@/components/comment-actions";
import { UserProfileLink } from "@/components/user-profile-link";
import { formatPostTimestamp } from "@/lib/format-datetime";
import { prepareHtmlLinks } from "@/lib/link-html";

export type CommentListItem = {
  id: string;
  content: string;
  createdAt: Date;
  totalLikes: number;
  likedByUser: boolean;
  user: { id: string; name: string };
  followedByViewer?: boolean;
};

type CommentsListProps = {
  blogId: string;
  comments: CommentListItem[];
  isSignedIn: boolean;
  viewerId?: string | null;
  heading?: string;
  emptyMessage?: string;
};

export function CommentsList({
  blogId,
  comments,
  isSignedIn,
  viewerId,
  heading = "Comments",
  emptyMessage,
}: CommentsListProps) {
  if (comments.length === 0) {
    return emptyMessage ? (
      <p className="mt-8 text-sm text-muted">{emptyMessage}</p>
    ) : null;
  }

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {heading} ({comments.length})
      </h2>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <UserProfileLink
                username={comment.user.name}
                userId={comment.user.id}
                isSignedIn={isSignedIn}
                viewerId={viewerId}
                initialFollowing={comment.followedByViewer ?? false}
              />
              <span aria-hidden>·</span>
              <span>{formatPostTimestamp(comment.createdAt)}</span>
            </p>
            <div
              className="post-content mt-2"
              dangerouslySetInnerHTML={{
                __html: prepareHtmlLinks(comment.content),
              }}
            />
            <CommentActions
              blogId={blogId}
              commentId={comment.id}
              totalLikes={comment.totalLikes}
              likedByUser={comment.likedByUser}
              isSignedIn={isSignedIn}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

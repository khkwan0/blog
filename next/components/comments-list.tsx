import { CommentActions } from "@/components/comment-actions";
import { prepareHtmlLinks } from "@/lib/link-html";

export type CommentListItem = {
  id: string;
  content: string;
  createdAt: Date;
  totalLikes: number;
  likedByUser: boolean;
  user: { name: string };
};

type CommentsListProps = {
  blogId: string;
  comments: CommentListItem[];
  isSignedIn: boolean;
  heading?: string;
  emptyMessage?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function CommentsList({
  blogId,
  comments,
  isSignedIn,
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {comment.user.name}
              {` · ${formatDate(comment.createdAt)}`}
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

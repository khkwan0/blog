import { CommentItem } from "@/components/comment-item";

export type CommentListItem = {
  id: string;
  parentId: string | null;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
  totalLikes: number;
  likedByUser: boolean;
  canDelete: boolean;
  user: { id: string; username: string; name: string };
};

type CommentsListProps = {
  blogId: string;
  comments: CommentListItem[];
  isSignedIn: boolean;
  heading?: string;
  emptyMessage?: string;
};

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
          <CommentItem
            key={comment.id}
            blogId={blogId}
            comment={comment}
            isSignedIn={isSignedIn}
          />
        ))}
      </ul>
    </section>
  );
}

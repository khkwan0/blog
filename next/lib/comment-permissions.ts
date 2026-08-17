import { UserRole } from "@/lib/user-roles";

type CommentForDelete = {
  userId: string;
  deletedAt: Date | null;
};

type ViewerForDelete = {
  id: string;
  role?: string | null;
};

export function canDeleteComment(
  comment: CommentForDelete,
  viewer: ViewerForDelete | null | undefined,
): boolean {
  if (!viewer || comment.deletedAt) {
    return false;
  }

  if (comment.userId === viewer.id) {
    return true;
  }

  return viewer.role === UserRole.ADMIN;
}

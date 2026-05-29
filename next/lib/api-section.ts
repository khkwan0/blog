export const COMMENT_SECTION = "comment" as const;
export const DELETE_SECTION = "delete" as const;

export type CommentSection = typeof COMMENT_SECTION;
export type DeleteSection = typeof DELETE_SECTION;

export function isCommentSection(value: unknown): value is CommentSection {
  return value === COMMENT_SECTION;
}

export function isDeleteSection(value: unknown): value is DeleteSection {
  return value === DELETE_SECTION;
}

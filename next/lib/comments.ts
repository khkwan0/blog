/** Non-deleted comments only (counts, likes, new replies). */
export const activeCommentWhere = {
  deletedAt: null,
} as const;

export const DELETED_COMMENT_LABEL = "This comment was deleted.";

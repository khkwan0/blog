export const REPLY_SECTION = "reply" as const;
export const DELETE_SECTION = "delete" as const;

export type ReplySection = typeof REPLY_SECTION;
export type DeleteSection = typeof DELETE_SECTION;

export function isReplySection(value: unknown): value is ReplySection {
  return value === REPLY_SECTION;
}

export function isDeleteSection(value: unknown): value is DeleteSection {
  return value === DELETE_SECTION;
}

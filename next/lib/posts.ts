import type { Prisma } from "@prisma/client";

export type BlogEntryStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const DELETED_POST_LABEL = "[deleted]";

/** Posts visible on the public blog (excludes ARCHIVED and DRAFT). */
export const publicPostWhere: Prisma.BlogEntryWhereInput = {
  status: "PUBLISHED",
};

/** Published or soft-deleted posts that can be opened by URL. */
export const viewablePostWhere: Prisma.BlogEntryWhereInput = {
  status: { in: ["PUBLISHED", "ARCHIVED"] },
};

export function isPostPubliclyVisible(status: BlogEntryStatus): boolean {
  return status === "PUBLISHED";
}

export function isPostViewable(status: BlogEntryStatus): boolean {
  return status === "PUBLISHED" || status === "ARCHIVED";
}

export function isPostDeleted(status: BlogEntryStatus): boolean {
  return status === "ARCHIVED";
}

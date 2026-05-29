import type { Prisma } from "@prisma/client";

/** Posts visible on the public blog (excludes ARCHIVED and DRAFT). */
export const publicPostWhere: Prisma.BlogEntryWhereInput = {
  status: "PUBLISHED",
};

export function isPostPubliclyVisible(
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): boolean {
  return status === "PUBLISHED";
}

/** Matches Prisma `UserRole` enum in `prisma/schema.prisma`. */
export const UserRole = {
  /** Normal signed-in member. */
  USER: "USER",
  /** Elevated privileges (moderation). */
  MODERATOR: "MODERATOR",
  /** Full administrative access. */
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MODERATOR]: 1,
  [UserRole.ADMIN]: 2,
};

export function userRoleRank(role: UserRole): number {
  return ROLE_RANK[role];
}

export function hasMinimumUserRole(role: UserRole, minimum: UserRole): boolean {
  return userRoleRank(role) >= userRoleRank(minimum);
}

export function isModeratorOrAbove(role: UserRole): boolean {
  return hasMinimumUserRole(role, UserRole.MODERATOR);
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

import { prisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/username";
import type { UserRole } from "@/lib/user-roles";
import { publicUserSelect } from "@/lib/user-public";

export async function findUserRoleById(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username: normalizeUsername(username) },
    select: {
      ...publicUserSelect,
      createdAt: true,
    },
  });
}

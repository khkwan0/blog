import { prisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/username";
import { publicUserSelect } from "@/lib/user-public";

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username: normalizeUsername(username) },
    select: {
      ...publicUserSelect,
      createdAt: true,
    },
  });
}

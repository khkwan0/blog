import { prisma } from "@/lib/prisma";

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { name: username.trim().toLowerCase() },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });
}

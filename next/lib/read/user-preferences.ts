import { prisma } from "@/lib/prisma";

export async function getUserContentColors(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      mentionColor: true,
      hashtagColor: true,
    },
  });
}

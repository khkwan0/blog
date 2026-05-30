import { prisma } from "@/lib/prisma";

export async function updateUserContentColors(
  userId: string,
  colors: {
    mentionColor: string | null;
    hashtagColor: string | null;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      mentionColor: colors.mentionColor,
      hashtagColor: colors.hashtagColor,
    },
    select: {
      mentionColor: true,
      hashtagColor: true,
    },
  });
}

export async function resetUserContentColors(userId: string) {
  return updateUserContentColors(userId, {
    mentionColor: null,
    hashtagColor: null,
  });
}

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function followUser(followerId: string, followingId: string) {
  try {
    await prisma.socialGraph.create({
      data: {
        followerId,
        followingId,
      },
    });
    return { created: true as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { created: false as const };
    }

    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.socialGraph.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });
}

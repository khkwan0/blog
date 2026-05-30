import { prisma } from "@/lib/prisma";

export async function followedUserIds(viewerId: string, targetIds: string[]) {
  if (targetIds.length === 0) {
    return new Set<string>();
  }

  const rows = await prisma.socialGraph.findMany({
    where: {
      followerId: viewerId,
      followingId: { in: targetIds },
    },
    select: { followingId: true },
  });

  return new Set(rows.map((row) => row.followingId));
}

export async function isFollowing(followerId: string, followingId: string) {
  const edge = await prisma.socialGraph.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    select: { id: true },
  });

  return edge !== null;
}

export async function followCounts(userId: string) {
  const [followerCount, followingCount] = await Promise.all([
    prisma.socialGraph.count({ where: { followingId: userId } }),
    prisma.socialGraph.count({ where: { followerId: userId } }),
  ]);

  return { followerCount, followingCount };
}

export async function listFollowers(userId: string) {
  return prisma.socialGraph.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      follower: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

export async function listFollowing(userId: string) {
  return prisma.socialGraph.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      following: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

export async function listFollowingAlphabetical(userId: string) {
  return prisma.socialGraph.findMany({
    where: { followerId: userId },
    orderBy: { following: { name: "asc" } },
    select: {
      following: {
        select: { id: true, name: true },
      },
    },
  });
}

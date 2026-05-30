import { publicPostWhere } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

/** Published original posts only (excludes repost wrappers). */
export async function getUserContentStats(userId: string) {
  const [postCount, aggregates, totalComments] = await Promise.all([
    prisma.blogEntry.count({
      where: {
        ownerId: userId,
        repostedFromId: null,
        ...publicPostWhere,
      },
    }),
    prisma.blogEntry.aggregate({
      where: {
        ownerId: userId,
        repostedFromId: null,
        ...publicPostWhere,
      },
      _sum: {
        totalLikes: true,
        totalReposts: true,
      },
    }),
    prisma.comment.count({
      where: {
        blogEntry: {
          ownerId: userId,
          repostedFromId: null,
          ...publicPostWhere,
        },
      },
    }),
  ]);

  return {
    postCount,
    totalLikes: aggregates._sum.totalLikes ?? 0,
    totalReposts: aggregates._sum.totalReposts ?? 0,
    totalComments,
  };
}

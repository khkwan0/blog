import { prisma } from "@/lib/prisma";

export async function getVideoBlockForDownload(blockId: string) {
  return prisma.blogEntryBlock.findUnique({
    where: { id: blockId },
    select: {
      id: true,
      format: true,
      content: true,
      blogEntry: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
}

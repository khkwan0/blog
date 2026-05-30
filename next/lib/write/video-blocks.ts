import { prisma } from "@/lib/prisma";

export async function updateVideoBlockContent(
  blockId: string,
  content: string,
) {
  await prisma.blogEntryBlock.update({
    where: { id: blockId },
    data: { content },
  });
}

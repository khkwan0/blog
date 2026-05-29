import { extractHashTags, extractHashTagsFromHtml } from "@/lib/extract-hashtags";
import { prisma } from "@/lib/prisma";

export type ProcessPostHashTagsResult = {
  hashtagsFound: number;
};

export async function processPostHashTags(
  blogEntryId: string,
): Promise<ProcessPostHashTagsResult> {
  const entry = await prisma.blogEntry.findUnique({
    where: { id: blogEntryId },
    select: {
      title: true,
      blocks: {
        where: { format: "HTML" },
        select: { content: true },
      },
    },
  });

  if (!entry) {
    return { hashtagsFound: 0 };
  }

  const htmlContent = entry.blocks.map((block) => block.content).join("\n");
  const fromHtml = extractHashTagsFromHtml(htmlContent);
  const fromTitle = extractHashTags(entry.title);

  const tags = new Map<string, { hashtag: string; display: string }>();
  for (const tag of [...fromTitle, ...fromHtml]) {
    if (!tags.has(tag.hashtag)) {
      tags.set(tag.hashtag, tag);
    }
  }

  const rows = [...tags.values()];

  await prisma.$transaction([
    prisma.hashTag.deleteMany({ where: { blogEntryId } }),
    ...(rows.length > 0
      ? [
          prisma.hashTag.createMany({
            data: rows.map((row) => ({
              blogEntryId,
              hashtag: row.hashtag,
              display: row.display,
            })),
          }),
        ]
      : []),
  ]);

  return { hashtagsFound: rows.length };
}

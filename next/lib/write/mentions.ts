import {
  extractMentions,
  extractMentionsFromHtml,
  type ParsedMention,
} from "@/lib/extract-mentions";
import { prisma } from "@/lib/prisma";

export type ProcessPostMentionsResult = {
  mentionsFound: number;
  mentionsStored: number;
};

export async function processPostMentions(
  blogEntryId: string,
): Promise<ProcessPostMentionsResult> {
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
    return { mentionsFound: 0, mentionsStored: 0 };
  }

  const htmlContent = entry.blocks.map((block) => block.content).join("\n");
  const fromHtml = extractMentionsFromHtml(htmlContent);
  const fromTitle = extractMentions(entry.title);

  const mentions = new Map<string, ParsedMention>();
  for (const mention of [...fromTitle, ...fromHtml]) {
    if (!mentions.has(mention.username)) {
      mentions.set(mention.username, mention);
    }
  }

  const mentionRows = [...mentions.values()];

  if (mentionRows.length === 0) {
    await prisma.blogEntryMention.deleteMany({ where: { blogEntryId } });
    return { mentionsFound: 0, mentionsStored: 0 };
  }

  const users = await prisma.user.findMany({
    where: { name: { in: mentionRows.map((row) => row.username) } },
    select: { id: true, name: true },
  });

  const userIdByUsername = new Map(users.map((user) => [user.name, user.id]));

  const rows = mentionRows.map((mention) => ({
    blogEntryId,
    username: mention.username,
    display: mention.display,
    userId: userIdByUsername.get(mention.username) ?? null,
  }));

  await prisma.$transaction([
    prisma.blogEntryMention.deleteMany({ where: { blogEntryId } }),
    prisma.blogEntryMention.createMany({ data: rows }),
  ]);

  return {
    mentionsFound: mentionRows.length,
    mentionsStored: rows.length,
  };
}

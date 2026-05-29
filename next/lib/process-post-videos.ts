import { extractLinksFromHtml } from "@/lib/extract-links";
import { prisma } from "@/lib/prisma";
import { downloadVideo, isYtDlpAvailable } from "@/lib/video-download";
import type { VideoBlockContent } from "@/lib/video-types";
import { findVideoLinks } from "@/lib/video-url";

function videoDownloadsEnabled(): boolean {
  return process.env.ENABLE_VIDEO_DOWNLOAD !== "false";
}

export async function processPostVideos(blogEntryId: string): Promise<void> {
  if (!videoDownloadsEnabled()) {
    return;
  }

  const entry = await prisma.blogEntry.findUnique({
    where: { id: blogEntryId },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!entry) {
    return;
  }

  const htmlContent = entry.blocks
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("\n");

  const videoLinks = findVideoLinks(extractLinksFromHtml(htmlContent));
  if (videoLinks.length === 0) {
    return;
  }

  const existingSourceUrls = new Set(
    entry.blocks
      .filter((block) => block.format === "VIDEO")
      .map((block) => {
        try {
          return (JSON.parse(block.content) as VideoBlockContent).sourceUrl;
        } catch {
          return null;
        }
      })
      .filter((url): url is string => Boolean(url)),
  );

  const ytdlpAvailable = await isYtDlpAvailable();
  let sortOrder =
    entry.blocks.reduce((max, block) => Math.max(max, block.sortOrder), -1) + 1;

  for (const video of videoLinks) {
    if (existingSourceUrls.has(video.url)) {
      continue;
    }

    const pendingContent: VideoBlockContent = {
      sourceUrl: video.url,
      provider: video.provider,
      status: "pending",
    };

    const block = await prisma.blogEntryBlock.create({
      data: {
        blogEntryId,
        format: "VIDEO",
        content: JSON.stringify(pendingContent),
        sortOrder: sortOrder++,
      },
    });

    if (!ytdlpAvailable) {
      await prisma.blogEntryBlock.update({
        where: { id: block.id },
        data: {
          content: JSON.stringify({
            ...pendingContent,
            status: "failed",
            error: "yt-dlp is not installed in this environment",
          } satisfies VideoBlockContent),
        },
      });
      continue;
    }

    try {
      const localPath = await downloadVideo(video, blogEntryId);
      await prisma.blogEntryBlock.update({
        where: { id: block.id },
        data: {
          content: JSON.stringify({
            ...pendingContent,
            status: "ready",
            localPath,
          } satisfies VideoBlockContent),
        },
      });
    } catch (error) {
      await prisma.blogEntryBlock.update({
        where: { id: block.id },
        data: {
          content: JSON.stringify({
            ...pendingContent,
            status: "failed",
            error:
              error instanceof Error ? error.message : "Video download failed",
          } satisfies VideoBlockContent),
        },
      });
    }
  }
}

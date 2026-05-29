import { extractLinksFromHtml } from "@/lib/extract-links";
import { prisma } from "@/lib/prisma";
import { downloadVideo, isYtDlpAvailable } from "@/lib/video-download";
import type { VideoBlockContent } from "@/lib/video-types";
import {
  findVideoLinks,
  isEmbedOnlyVideo,
  type ParsedVideoUrl,
} from "@/lib/video-url";
import { isYoutubeEmbeddable } from "@/lib/youtube-embed";

export type ProcessPostVideosResult = {
  linksFound: number;
  videoLinksFound: number;
  videosDownloaded: number;
  videosFailed: number;
};

function videoDownloadsEnabled(): boolean {
  return process.env.ENABLE_VIDEO_DOWNLOAD !== "false";
}

function parseVideoBlock(block: { id: string; content: string }) {
  try {
    return {
      id: block.id,
      content: JSON.parse(block.content) as VideoBlockContent,
    };
  } catch {
    return null;
  }
}

function blockContentFromVideo(video: ParsedVideoUrl): VideoBlockContent {
  return {
    sourceUrl: video.url,
    provider: video.provider,
    videoId: video.videoId,
    status: "pending",
    ...(video.isLive ? { isLive: true } : {}),
    ...(video.streamKind ? { streamKind: video.streamKind } : {}),
    ...(video.directType ? { directType: video.directType } : {}),
  };
}

async function markVideoFailed(
  blockId: string,
  content: VideoBlockContent,
  error: string,
) {
  await prisma.blogEntryBlock.update({
    where: { id: blockId },
    data: {
      content: JSON.stringify({
        ...content,
        status: "failed",
        error,
      } satisfies VideoBlockContent),
    },
  });
}

async function markVideoReady(
  blockId: string,
  content: VideoBlockContent,
  localPath: string,
) {
  await prisma.blogEntryBlock.update({
    where: { id: blockId },
    data: {
      content: JSON.stringify({
        ...content,
        status: "ready",
        localPath,
      } satisfies VideoBlockContent),
    },
  });
}

async function markVideoEmbedded(blockId: string, content: VideoBlockContent) {
  await prisma.blogEntryBlock.update({
    where: { id: blockId },
    data: {
      content: JSON.stringify({
        ...content,
        status: "embedded",
      } satisfies VideoBlockContent),
    },
  });
}

async function tryDownloadVideo(
  video: ParsedVideoUrl,
  blockId: string,
  pendingContent: VideoBlockContent,
  blogEntryId: string,
  result: ProcessPostVideosResult,
) {
  if (!videoDownloadsEnabled()) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      "Video download is disabled",
    );
    return;
  }

  if (!(await isYtDlpAvailable())) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      "yt-dlp is not installed in this environment",
    );
    return;
  }

  try {
    const localPath = await downloadVideo(video, blogEntryId);
    result.videosDownloaded += 1;
    await markVideoReady(blockId, pendingContent, localPath);
  } catch (error) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      error instanceof Error ? error.message : "Video download failed",
    );
  }
}

async function processYoutubeVideo(
  video: ParsedVideoUrl,
  blockId: string,
  pendingContent: VideoBlockContent,
  blogEntryId: string,
  result: ProcessPostVideosResult,
) {
  const embeddable =
    video.isLive === true || (await isYoutubeEmbeddable(video.url));

  if (embeddable) {
    await markVideoEmbedded(blockId, pendingContent);
    return;
  }

  if (!videoDownloadsEnabled()) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      "YouTube embed unavailable and video download is disabled",
    );
    return;
  }

  if (!(await isYtDlpAvailable())) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      "YouTube embed unavailable and yt-dlp is not installed",
    );
    return;
  }

  try {
    const localPath = await downloadVideo(video, blogEntryId);
    result.videosDownloaded += 1;
    await markVideoReady(blockId, pendingContent, localPath);
  } catch (error) {
    result.videosFailed += 1;
    await markVideoFailed(
      blockId,
      pendingContent,
      error instanceof Error ? error.message : "Video download failed",
    );
  }
}

export async function processPostVideos(
  blogEntryId: string,
): Promise<ProcessPostVideosResult> {
  const empty: ProcessPostVideosResult = {
    linksFound: 0,
    videoLinksFound: 0,
    videosDownloaded: 0,
    videosFailed: 0,
  };

  const entry = await prisma.blogEntry.findUnique({
    where: { id: blogEntryId },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!entry) {
    return empty;
  }

  const htmlContent = entry.blocks
    .filter((block) => block.format === "HTML")
    .map((block) => block.content)
    .join("\n");

  const links = extractLinksFromHtml(htmlContent);
  const videoLinks = findVideoLinks(links);

  const result: ProcessPostVideosResult = {
    linksFound: links.length,
    videoLinksFound: videoLinks.length,
    videosDownloaded: 0,
    videosFailed: 0,
  };

  if (videoLinks.length === 0) {
    return result;
  }

  const existingVideoBlocks = new Map<
    string,
    { id: string; content: VideoBlockContent }
  >();
  for (const block of entry.blocks) {
    if (block.format !== "VIDEO") {
      continue;
    }

    const parsed = parseVideoBlock(block);
    if (parsed) {
      existingVideoBlocks.set(parsed.content.sourceUrl, parsed);
    }
  }

  let sortOrder =
    entry.blocks.reduce((max, block) => Math.max(max, block.sortOrder), -1) + 1;

  for (const video of videoLinks) {
    const existing = existingVideoBlocks.get(video.url);
    if (
      existing?.content.status === "ready" ||
      existing?.content.status === "embedded"
    ) {
      continue;
    }

    const pendingContent = blockContentFromVideo(video);

    let blockId: string;
    if (existing) {
      blockId = existing.id;
      await prisma.blogEntryBlock.update({
        where: { id: blockId },
        data: { content: JSON.stringify(pendingContent) },
      });
    } else {
      const block = await prisma.blogEntryBlock.create({
        data: {
          blogEntryId,
          format: "VIDEO",
          content: JSON.stringify(pendingContent),
          sortOrder: sortOrder++,
        },
      });
      blockId = block.id;
    }

    if (isEmbedOnlyVideo(video)) {
      await markVideoEmbedded(blockId, pendingContent);
      continue;
    }

    if (video.provider === "youtube") {
      await processYoutubeVideo(
        video,
        blockId,
        pendingContent,
        blogEntryId,
        result,
      );
      continue;
    }

    if (video.provider === "vimeo") {
      await markVideoEmbedded(blockId, pendingContent);
      continue;
    }

    await tryDownloadVideo(
      video,
      blockId,
      pendingContent,
      blogEntryId,
      result,
    );
  }

  return result;
}

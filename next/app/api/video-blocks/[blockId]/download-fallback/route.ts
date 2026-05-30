import { NextResponse } from "next/server";
import { getVideoBlockForDownload } from "@/lib/read/video-blocks";
import { updateVideoBlockContent } from "@/lib/write/video-blocks";
import { downloadVideo, isYtDlpAvailable } from "@/lib/video-download";
import type { VideoBlockContent } from "@/lib/video-types";
import { parseVideoUrl } from "@/lib/video-url";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blockId: string }>;
};

function videoDownloadsEnabled(): boolean {
  return process.env.ENABLE_VIDEO_DOWNLOAD !== "false";
}

export async function POST(_request: Request, context: RouteContext) {
  if (!videoDownloadsEnabled()) {
    return NextResponse.json(
      { error: "Video download is disabled" },
      { status: 503 },
    );
  }

  const { blockId } = await context.params;

  const block = await getVideoBlockForDownload(blockId);

  if (
    !block ||
    block.format !== "VIDEO" ||
    block.blogEntry.status !== "PUBLISHED"
  ) {
    return NextResponse.json({ error: "Video block not found" }, { status: 404 });
  }

  let video: VideoBlockContent;
  try {
    video = JSON.parse(block.content) as VideoBlockContent;
  } catch {
    return NextResponse.json({ error: "Invalid video block" }, { status: 400 });
  }

  if (video.provider !== "youtube" || video.status !== "embedded") {
    return NextResponse.json({ error: "Fallback not applicable" }, { status: 409 });
  }

  if (!(await isYtDlpAvailable())) {
    return NextResponse.json(
      { error: "yt-dlp is not installed" },
      { status: 503 },
    );
  }

  const parsed = parseVideoUrl(video.sourceUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
  }

  await updateVideoBlockContent(
    blockId,
    JSON.stringify({
      ...video,
      status: "pending",
    } satisfies VideoBlockContent),
  );

  try {
    const localPath = await downloadVideo(parsed, block.blogEntry.id);
    const ready: VideoBlockContent = {
      ...video,
      status: "ready",
      localPath,
    };

    await updateVideoBlockContent(blockId, JSON.stringify(ready));

    return NextResponse.json({ status: "ready", localPath });
  } catch (error) {
    const failed: VideoBlockContent = {
      ...video,
      status: "failed",
      error:
        error instanceof Error ? error.message : "Video download failed",
    };

    await updateVideoBlockContent(blockId, JSON.stringify(failed));

    return NextResponse.json(
      { error: failed.error, status: "failed" },
      { status: 502 },
    );
  }
}

import {
  localVideoUrl,
  parseVideoBlockContent,
} from "@/lib/video-types";
import { prepareHtmlLinks } from "@/lib/link-html";
import { KickEmbed, TwitchEmbed } from "@/components/live-embeds";
import { StreamVideo } from "@/components/stream-video";
import { VimeoEmbed } from "@/components/vimeo-embed";
import { YoutubeEmbed } from "@/components/youtube-embed";

type PostBlock = {
  id: string;
  format: "HTML" | "VIDEO" | "TEXT" | "AUDIO" | "MARKDOWN";
  content: string;
  sortOrder: number;
};

type PostBlocksProps = {
  blocks: PostBlock[];
};

function EmbeddedVideoPlayer({
  blockId,
  video,
}: {
  blockId: string;
  video: NonNullable<ReturnType<typeof parseVideoBlockContent>>;
}) {
  if (video.provider === "youtube" && video.videoId) {
    return (
      <YoutubeEmbed
        key={blockId}
        videoId={video.videoId}
        isLive={video.isLive}
      />
    );
  }

  if (video.provider === "vimeo" && video.videoId) {
    return (
      <VimeoEmbed
        key={blockId}
        videoId={video.videoId}
        isLive={video.isLive}
      />
    );
  }

  if (video.provider === "twitch" && video.videoId) {
    return (
      <TwitchEmbed
        key={blockId}
        videoId={video.videoId}
        streamKind={video.streamKind}
        isLive={video.isLive}
      />
    );
  }

  if (video.provider === "kick" && video.videoId) {
    return <KickEmbed key={blockId} channel={video.videoId} />;
  }

  if (video.provider === "direct") {
    return (
      <StreamVideo
        key={blockId}
        src={video.sourceUrl}
        directType={video.directType}
        isLive={video.isLive}
      />
    );
  }

  return null;
}

export function PostBlocks({ blocks }: PostBlocksProps) {
  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block) => {
        if (block.format === "HTML") {
          return (
            <div
              key={block.id}
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: prepareHtmlLinks(block.content),
              }}
            />
          );
        }

        if (block.format === "VIDEO") {
          const video = parseVideoBlockContent(block.content);
          if (!video) {
            return null;
          }

          if (video.status === "ready" && video.localPath) {
            return (
              <video
                key={block.id}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-lg bg-black"
                src={localVideoUrl(video.localPath)}
              />
            );
          }

          if (
            video.status === "embedded" ||
            (video.provider === "youtube" && video.status === "failed")
          ) {
            const player = EmbeddedVideoPlayer({ blockId: block.id, video });
            if (player) {
              return player;
            }
          }

          if (video.status === "pending") {
            return (
              <p key={block.id} className="text-sm text-muted">
                {video.isLive
                  ? `Loading live stream from ${video.provider}…`
                  : `Downloading video from ${video.provider}…`}
              </p>
            );
          }

          return (
            <p key={block.id} className="text-sm text-muted">
              Could not save video locally.{" "}
              <a
                href={video.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                Watch at source
              </a>
              {video.error ? ` (${video.error})` : null}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

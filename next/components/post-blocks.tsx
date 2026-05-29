import {
  localVideoUrl,
  parseVideoBlockContent,
} from "@/lib/video-types";

type PostBlock = {
  id: string;
  format: "HTML" | "VIDEO" | "TEXT" | "AUDIO" | "MARKDOWN";
  content: string;
  sortOrder: number;
};

type PostBlocksProps = {
  blocks: PostBlock[];
};

export function PostBlocks({ blocks }: PostBlocksProps) {
  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block) => {
        if (block.format === "HTML") {
          return (
            <div
              key={block.id}
              className="prose prose-zinc max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: block.content }}
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

          if (video.status === "pending") {
            return (
              <p key={block.id} className="text-sm text-muted">
                Downloading video from {video.provider}…
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

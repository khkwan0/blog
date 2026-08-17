import { youtubeEmbedUrl } from "@/lib/video-types";

type YoutubeEmbedProps = {
  videoId: string;
  isLive?: boolean;
};

export function YoutubeEmbed({ videoId, isLive }: YoutubeEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {isLive ? (
        <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Live
        </span>
      ) : null}
      <iframe
        title={isLive ? "YouTube live stream" : "YouTube video"}
        src={`${youtubeEmbedUrl(videoId)}?rel=0`}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

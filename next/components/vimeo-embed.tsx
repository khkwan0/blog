import { vimeoEmbedUrl } from "@/lib/video-types";

type VimeoEmbedProps = {
  videoId: string;
  isLive?: boolean;
};

export function VimeoEmbed({ videoId, isLive }: VimeoEmbedProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      {isLive ? (
        <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Live
        </span>
      ) : null}
      <iframe
        title="Vimeo video"
        src={`${vimeoEmbedUrl(videoId)}?title=0&byline=0&portrait=0`}
        className="h-full w-full"
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

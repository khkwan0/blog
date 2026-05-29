import { youtubeEmbedUrl } from "@/lib/video-types";

type YoutubeEmbedProps = {
  videoId: string;
};

export function YoutubeEmbed({ videoId }: YoutubeEmbedProps) {
  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        title="YouTube video"
        src={`${youtubeEmbedUrl(videoId)}?rel=0`}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

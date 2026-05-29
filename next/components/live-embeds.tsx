import {
  embedParentDomain,
  kickEmbedUrl,
  twitchEmbedUrl,
} from "@/lib/video-types";
import type { StreamKind } from "@/lib/video-url";

type TwitchEmbedProps = {
  videoId: string;
  streamKind?: StreamKind;
  isLive?: boolean;
};

export function TwitchEmbed({ videoId, streamKind, isLive }: TwitchEmbedProps) {
  const parentDomain = embedParentDomain();
  const src = twitchEmbedUrl(videoId, streamKind, parentDomain);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      {isLive ? (
        <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Live
        </span>
      ) : null}
      <iframe
        title="Twitch stream"
        src={src}
        className="h-full w-full"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

type KickEmbedProps = {
  channel: string;
};

export function KickEmbed({ channel }: KickEmbedProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
        Live
      </span>
      <iframe
        title="Kick stream"
        src={kickEmbedUrl(channel)}
        className="h-full w-full"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

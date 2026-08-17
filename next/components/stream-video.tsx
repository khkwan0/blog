"use client";

import type Hls from "hls.js";
import { useEffect, useRef } from "react";

type StreamVideoProps = {
  src: string;
  directType?: "file" | "hls";
  isLive?: boolean;
};

export function StreamVideo({ src, directType, isLive }: StreamVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || directType !== "hls") {
      return;
    }

    let hls: Hls | null = null;
    let cancelled = false;

    void (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (cancelled || !videoRef.current) {
        return;
      }

      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        return;
      }

      videoRef.current.removeAttribute("src");
    })();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src, directType]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      {isLive ? (
        <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Live
        </span>
      ) : null}
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full"
        src={directType === "file" ? src : undefined}
      />
    </div>
  );
}

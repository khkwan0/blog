"use client";

import { useEffect, useState } from "react";
import {
  inferFacebookDimensions,
  isVerticalFacebookEmbed,
  type FacebookEmbedDimensions,
} from "@/lib/facebook-embed-meta";
import { facebookEmbedUrl } from "@/lib/video-types";

type FacebookEmbedProps = {
  sourceUrl: string;
  embedWidth?: number;
  embedHeight?: number;
};

export function FacebookEmbed({
  sourceUrl,
  embedWidth,
  embedHeight,
}: FacebookEmbedProps) {
  const [dimensions, setDimensions] = useState<FacebookEmbedDimensions>(() => {
    if (embedWidth && embedHeight) {
      return { width: embedWidth, height: embedHeight };
    }

    return inferFacebookDimensions(sourceUrl);
  });

  useEffect(() => {
    if (embedWidth && embedHeight) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const response = await fetch(
        `/api/facebook-oembed?url=${encodeURIComponent(sourceUrl)}`,
      );

      if (!response.ok || cancelled) {
        return;
      }

      const data = (await response.json()) as FacebookEmbedDimensions;
      if (!cancelled && data.width > 0 && data.height > 0) {
        setDimensions(data);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceUrl, embedWidth, embedHeight]);

  const vertical = isVerticalFacebookEmbed(dimensions);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-black ${
        vertical ? "mx-auto max-w-[min(100%,360px)]" : "max-w-3xl"
      }`}
      style={{
        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        maxHeight: vertical ? "min(85vh, 720px)" : undefined,
      }}
    >
      <iframe
        title="Facebook video"
        src={facebookEmbedUrl(
          sourceUrl,
          dimensions.width,
          dimensions.height,
        )}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { resolveMediaPath } from "@/lib/video-storage";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".m4v": "video/x-m4v",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const relativePath = segments.join("/");

  if (!relativePath.startsWith("posts/")) {
    return new Response("Not found", { status: 404 });
  }

  let absolutePath: string;
  try {
    absolutePath = resolveMediaPath(relativePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  let fileStat;
  try {
    fileStat = await stat(absolutePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!fileStat.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const contentType =
    CONTENT_TYPES[path.extname(absolutePath).toLowerCase()] ??
    "application/octet-stream";

  const stream = createReadStream(absolutePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

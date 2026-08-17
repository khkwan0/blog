import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { resolveMediaPath } from "@/lib/video-storage";

const VIDEOS_SUBDIR = "videos";

export function contentVideoMediaUrl(relativePath: string) {
  return `/api/media/${relativePath}`;
}

export function isHostedContentVideoUrl(src: string | null | undefined) {
  return Boolean(src?.startsWith("/api/media/videos/"));
}

export function contentVideoRelativePath(userId: string, ext: string, id = randomUUID()) {
  return path.posix.join(VIDEOS_SUBDIR, userId, `${id}${ext}`);
}

export async function writeContentVideoFile(
  userId: string,
  ext: string,
  bytes: Uint8Array,
) {
  const relativePath = contentVideoRelativePath(userId, ext);
  const absolutePath = resolveMediaPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
  return { relativePath, url: contentVideoMediaUrl(relativePath) };
}

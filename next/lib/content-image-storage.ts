import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { resolveMediaPath } from "@/lib/video-storage";

const IMAGES_SUBDIR = "images";

export function contentImageMediaUrl(relativePath: string) {
  return `/api/media/${relativePath}`;
}

export function isHostedContentImageUrl(src: string | null | undefined) {
  return Boolean(src?.startsWith("/api/media/images/"));
}

export function contentImageRelativePath(userId: string, ext: string, id = randomUUID()) {
  return path.posix.join(IMAGES_SUBDIR, userId, `${id}${ext}`);
}

export async function writeContentImageFile(
  userId: string,
  ext: string,
  bytes: Uint8Array,
) {
  const relativePath = contentImageRelativePath(userId, ext);
  const absolutePath = resolveMediaPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
  return { relativePath, url: contentImageMediaUrl(relativePath) };
}

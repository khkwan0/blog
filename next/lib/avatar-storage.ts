import { mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import {
  extensionFromImageUpload,
  MAX_AVATAR_BYTES,
} from "@/lib/image-formats";
import { getMediaRoot, resolveMediaPath } from "@/lib/video-storage";

const AVATAR_SUBDIR = "avatars";

export { MAX_AVATAR_BYTES };

export function avatarMediaUrl(relativePath: string) {
  return `/api/media/${relativePath}`;
}

export function isHostedAvatarUrl(image: string | null | undefined) {
  return Boolean(image?.startsWith("/api/media/avatars/"));
}

export const extensionFromUpload = extensionFromImageUpload;

export function avatarRelativePath(userId: string, ext: string) {
  return path.posix.join(AVATAR_SUBDIR, `${userId}${ext}`);
}

export async function writeAvatarFile(
  userId: string,
  ext: string,
  bytes: Uint8Array,
) {
  const relativePath = avatarRelativePath(userId, ext);
  const absolutePath = resolveMediaPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
  return { relativePath, url: avatarMediaUrl(relativePath) };
}

export async function deleteHostedAvatarFiles(userId: string) {
  const avatarDir = path.join(getMediaRoot(), AVATAR_SUBDIR);

  let entries: string[];
  try {
    entries = await readdir(avatarDir);
  } catch {
    return;
  }

  await Promise.all(
    entries
      .filter((name) => name.startsWith(userId))
      .map((name) =>
        rm(path.join(avatarDir, name), { force: true }).catch(() => undefined),
      ),
  );
}

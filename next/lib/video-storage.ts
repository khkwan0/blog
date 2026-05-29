import path from "path";

/** Host-persisted media directory (bind-mounted in Docker at /data/media). */
export function getMediaRoot(): string {
  if (process.env.MEDIA_STORAGE_PATH) {
    return process.env.MEDIA_STORAGE_PATH;
  }

  // Local dev without Docker: repo-root storage/media (one level above next/)
  return path.resolve(process.cwd(), "..", "storage", "media");
}

export function getPostVideoDir(postId: string): string {
  return path.join(getMediaRoot(), "posts", postId);
}

export function resolveMediaPath(relativePath: string): string {
  const root = path.resolve(getMediaRoot());
  const absolute = path.resolve(root, relativePath);

  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid media path");
  }

  return absolute;
}

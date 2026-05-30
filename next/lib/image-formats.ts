import path from "path";

/** Extensions we accept for uploads (static and animated). */
export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".bmp",
  ".ico",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
]);

export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/bmp": ".bmp",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/tiff": ".tif",
};

export const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/x-icon,image/vnd.microsoft.icon,image/heic,image/heif,image/tiff";

export const IMAGE_FORMAT_LABEL =
  "JPEG, PNG, WebP, GIF, AVIF, BMP, ICO, HEIC, HEIF, or TIFF";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const MAX_CONTENT_IMAGE_BYTES = 15 * 1024 * 1024;

export function extensionFromImageUpload(file: File) {
  const mimeExt = MIME_TO_EXT[file.type];
  if (mimeExt) {
    return mimeExt;
  }

  const fromName = path.extname(file.name).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(fromName)) {
    return null;
  }

  return fromName === ".jpeg" ? ".jpg" : fromName;
}

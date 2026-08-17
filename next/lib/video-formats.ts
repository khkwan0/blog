import path from "path";

/** Extensions we accept for post video uploads. */
export const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".mkv",
  ".m4v",
]);

export const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
  "video/x-m4v": ".m4v",
};

export const VIDEO_EXT_TO_MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".m4v": "video/x-m4v",
};

export const VIDEO_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-m4v,.mp4,.webm,.mov,.mkv,.m4v";

export const VIDEO_FORMAT_LABEL = "MP4, WebM, MOV, MKV, or M4V";

export const MAX_CONTENT_VIDEO_BYTES = 250 * 1024 * 1024;

export function extensionFromVideoUpload(file: File) {
  const mimeExt = VIDEO_MIME_TO_EXT[file.type];
  if (mimeExt) {
    return mimeExt;
  }

  const fromName = path.extname(file.name).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(fromName)) {
    return null;
  }

  return fromName;
}

import {
  extensionFromVideoUpload,
  MAX_CONTENT_VIDEO_BYTES,
  VIDEO_FORMAT_LABEL,
} from "@/lib/video-formats";
import { writeContentVideoFile } from "@/lib/content-video-storage";

export async function uploadContentVideo(input: {
  userId: string;
  file: File;
}) {
  const { file, userId } = input;

  if (file.size === 0) {
    return { error: "Video file is empty.", status: 400 as const };
  }

  if (file.size > MAX_CONTENT_VIDEO_BYTES) {
    return {
      error: "Video must be 250 MB or smaller.",
      status: 400 as const,
    };
  }

  const ext = extensionFromVideoUpload(file);
  if (!ext) {
    return {
      error: `Use a supported video (${VIDEO_FORMAT_LABEL}).`,
      status: 400 as const,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { url } = await writeContentVideoFile(userId, ext, bytes);

  return { url, status: 201 as const };
}

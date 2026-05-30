import {
  extensionFromImageUpload,
  IMAGE_FORMAT_LABEL,
  MAX_CONTENT_IMAGE_BYTES,
} from "@/lib/image-formats";
import { writeContentImageFile } from "@/lib/content-image-storage";

export async function uploadContentImage(input: {
  userId: string;
  file: File;
}) {
  const { file, userId } = input;

  if (file.size === 0) {
    return { error: "Image file is empty.", status: 400 as const };
  }

  if (file.size > MAX_CONTENT_IMAGE_BYTES) {
    return {
      error: "Image must be 15 MB or smaller.",
      status: 400 as const,
    };
  }

  const ext = extensionFromImageUpload(file);
  if (!ext) {
    return {
      error: `Use a supported image (${IMAGE_FORMAT_LABEL}).`,
      status: 400 as const,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { url } = await writeContentImageFile(userId, ext, bytes);

  return { url, status: 201 as const };
}

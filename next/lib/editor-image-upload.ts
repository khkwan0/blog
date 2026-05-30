import type { Editor } from "@tiptap/react";
import { extensionFromImageUpload } from "@/lib/image-formats";

export async function uploadEditorImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("image", file);

  const response = await fetch("/api/content-images", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to upload image.");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export function insertUploadedImage(editor: Editor, url: string) {
  editor.chain().focus().setImage({ src: url }).run();
}

export function imageFileFromClipboard(
  clipboardData: DataTransfer | null,
): File | null {
  if (!clipboardData) {
    return null;
  }

  for (const item of clipboardData.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }
  }

  return null;
}

export function imageFilesFromDrop(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) {
    return [];
  }

  return Array.from(dataTransfer.files).filter(
    (file) => file.type.startsWith("image/") || extensionFromImageUpload(file),
  );
}

export async function handleEditorImageFile(
  editor: Editor,
  file: File,
  onError: (message: string) => void,
) {
  if (!extensionFromImageUpload(file)) {
    onError("Unsupported image type.");
    return;
  }

  try {
    const url = await uploadEditorImage(file);
    insertUploadedImage(editor, url);
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unable to upload image.");
  }
}

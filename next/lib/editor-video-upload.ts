import type { Editor } from "@tiptap/react";
import { extensionFromVideoUpload } from "@/lib/video-formats";

export async function uploadEditorVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("video", file);

  const response = await fetch("/api/content-videos", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to upload video.");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export function insertUploadedVideoLink(editor: Editor, url: string, label: string) {
  const safeLabel = label.replace(/[<>&"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });

  editor
    .chain()
    .focus()
    .insertContent(`<p><a href="${url}">${safeLabel}</a></p>`)
    .run();
}

export function videoFileFromClipboard(
  clipboardData: DataTransfer | null,
): File | null {
  if (!clipboardData) {
    return null;
  }

  for (const item of clipboardData.items) {
    if (item.kind !== "file") {
      continue;
    }

    const file = item.getAsFile();
    if (file && (file.type.startsWith("video/") || extensionFromVideoUpload(file))) {
      return file;
    }
  }

  return null;
}

export function videoFilesFromDrop(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) {
    return [];
  }

  return Array.from(dataTransfer.files).filter(
    (file) => file.type.startsWith("video/") || extensionFromVideoUpload(file),
  );
}

export async function handleEditorVideoFile(
  editor: Editor,
  file: File,
  onError: (message: string) => void,
) {
  if (!extensionFromVideoUpload(file)) {
    onError("Unsupported video type.");
    return;
  }

  try {
    const url = await uploadEditorVideo(file);
    insertUploadedVideoLink(editor, url, file.name || "Video");
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unable to upload video.");
  }
}

"use client";

import type { Editor } from "@tiptap/react";
import { useRef } from "react";
import { IMAGE_ACCEPT } from "@/lib/image-formats";
import { handleEditorImageFile } from "@/lib/editor-image-upload";

type EditorImageButtonProps = {
  editor: Editor | null;
  disabled?: boolean;
  onError: (message: string) => void;
};

export function EditorImageButton({
  editor,
  disabled,
  onError,
}: EditorImageButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    await handleEditorImageFile(editor, file, onError);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        aria-label="Image"
        title="Upload image (JPEG, PNG, WebP, GIF, and more)"
        disabled={disabled || !editor}
        onClick={() => inputRef.current?.click()}
        className="rounded px-2 py-1 text-sm transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        Image
      </button>
    </>
  );
}

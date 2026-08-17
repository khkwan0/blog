"use client";

import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { VIDEO_ACCEPT } from "@/lib/video-formats";
import { handleEditorVideoFile } from "@/lib/editor-video-upload";

type EditorVideoButtonProps = {
  editor: Editor | null;
  disabled?: boolean;
  onError: (message: string) => void;
  variant?: "text" | "icon";
  icon?: ReactNode;
};

export function EditorVideoButton({
  editor,
  disabled,
  onError,
  variant = "text",
  icon,
}: EditorVideoButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    await handleEditorVideoFile(editor, file, onError);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        aria-label="Video"
        title="Upload video (MP4, WebM, MOV, MKV, M4V) or paste a video link"
        disabled={disabled || !editor}
        onClick={() => inputRef.current?.click()}
        className={
          variant === "icon"
            ? "rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            : "rounded px-2 py-1 text-sm transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        }
      >
        {variant === "icon" ? icon : "Video"}
      </button>
    </>
  );
}

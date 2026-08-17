"use client";

import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { EditorImageButton } from "@/components/editor-image-button";
import { EditorVideoButton } from "@/components/editor-video-button";

type ComposerMediaBarProps = {
  editor: Editor | null;
  disabled?: boolean;
  onError: (message: string) => void;
};

type MediaIconButtonProps = {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function MediaIconButton({
  label,
  title,
  disabled,
  onClick,
  children,
}: MediaIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

export function ComposerMediaBar({
  editor,
  disabled,
  onError,
}: ComposerMediaBarProps) {
  const focusEditor = () => {
    editor?.chain().focus().run();
  };

  return (
    <div className="mt-2 flex items-center gap-0.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
      <EditorImageButton
        editor={editor}
        disabled={disabled}
        onError={onError}
        variant="icon"
        icon={<ImageIcon />}
      />
      <EditorVideoButton
        editor={editor}
        disabled={disabled}
        onError={onError}
        variant="icon"
        icon={<VideoIcon />}
      />
      <MediaIconButton
        label="File"
        title="Upload a file or paste a file link in your post"
        disabled={disabled || !editor}
        onClick={focusEditor}
      >
        <FileIcon />
      </MediaIconButton>
    </div>
  );
}

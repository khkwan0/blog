"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ComposerMediaBar } from "@/components/composer-media-bar";
import { EditorImageButton } from "@/components/editor-image-button";
import { EditorVideoButton } from "@/components/editor-video-button";
import { UserAvatar } from "@/components/user-avatar";
import { createEditorExtensions } from "@/lib/editor-extensions";
import {
  handleEditorImageFile,
  imageFileFromClipboard,
  imageFilesFromDrop,
} from "@/lib/editor-image-upload";
import {
  handleEditorVideoFile,
  videoFileFromClipboard,
  videoFilesFromDrop,
} from "@/lib/editor-video-upload";
import { isEmptyEditorHtml } from "@/lib/is-empty-editor-html";

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition-colors disabled:opacity-40 ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      }`}
    >
      {label}
    </button>
  );
}

export type PostEditorInnerProps = {
  postId?: string;
  initialContent?: string;
  cancelHref?: string;
  displayName?: string;
  avatarImage?: string | null;
};

export function PostEditorInner({
  postId,
  initialContent,
  cancelHref,
  displayName,
  avatarImage,
}: PostEditorInnerProps = {}) {
  const isEditing = Boolean(postId);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const hydratedRef = useRef(false);

  const editor = useEditor({
    extensions: createEditorExtensions(
      isEditing
        ? { placeholder: "Write your post..." }
        : { placeholder: "Share something..." },
    ),
    immediatelyRender: false,
    content: initialContent || undefined,
    onCreate: ({ editor: created }) => {
      editorRef.current = created;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor focus:outline-none ${
          isEditing
            ? "min-h-[12rem] px-3 py-2"
            : "min-h-[4.5rem] px-1 py-2"
        }`,
      },
      handlePaste: (_view, event) => {
        const activeEditor = editorRef.current;
        if (!activeEditor) {
          return false;
        }

        const videoFile = videoFileFromClipboard(event.clipboardData);
        if (videoFile) {
          event.preventDefault();
          void handleEditorVideoFile(activeEditor, videoFile, setError);
          return true;
        }

        const imageFile = imageFileFromClipboard(event.clipboardData);
        if (imageFile) {
          event.preventDefault();
          void handleEditorImageFile(activeEditor, imageFile, setError);
          return true;
        }

        return false;
      },
      handleDrop: (_view, event) => {
        const activeEditor = editorRef.current;
        if (!activeEditor) {
          return false;
        }

        const videoFiles = videoFilesFromDrop(event.dataTransfer);
        if (videoFiles.length > 0) {
          event.preventDefault();
          void handleEditorVideoFile(activeEditor, videoFiles[0], setError);
          return true;
        }

        const imageFiles = imageFilesFromDrop(event.dataTransfer);
        if (imageFiles.length > 0) {
          event.preventDefault();
          void handleEditorImageFile(activeEditor, imageFiles[0], setError);
          return true;
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor || !initialContent || hydratedRef.current) {
      return;
    }

    editor.commands.setContent(initialContent);
    hydratedRef.current = true;
  }, [editor, initialContent]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const content = editor.getHTML();
    const isEmpty = isEmptyEditorHtml(content, editor.getText());

    if (isEmpty) {
      setError("Add some content before publishing.");
      return;
    }

    setError("");
    setLoading(true);

    const response = await fetch(
      isEditing ? `/api/posts/${postId}` : "/api/posts",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? { content }
            : {
                content,
                status: "PUBLISHED",
              },
        ),
      },
    );

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(
        data?.error ??
          (isEditing ? "Unable to save changes." : "Unable to publish post."),
      );
      return;
    }

    if (isEditing) {
      router.push(`/post/${postId}`);
      router.refresh();
      return;
    }

    editor.commands.clearContent();
    router.refresh();
  };

  return (
    <section
      className={
        isEditing
          ? "surface-card mb-10"
          : "mb-0"
      }
    >
      {isEditing ? (
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Edit post</h2>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        <div
          className={
            isEditing
              ? undefined
              : "flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4"
          }
        >
          {!isEditing && displayName ? (
            <Link
              href="/settings"
              className="mt-0.5 hidden shrink-0 sm:block"
              title="Account settings"
            >
              <UserAvatar
                name={displayName}
                image={avatarImage}
                size="md"
              />
            </Link>
          ) : null}
          <div className={isEditing ? undefined : "min-w-0 flex-1"}>
            <div
              className={
                isEditing
                  ? "overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-600"
                  : undefined
              }
            >
              {isEditing ? (
                <div className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-950">
                  <ToolbarButton
                    label="Bold"
                    active={editor?.isActive("bold")}
                    disabled={!editor}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  />
                  <ToolbarButton
                    label="Italic"
                    active={editor?.isActive("italic")}
                    disabled={!editor}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  />
                  <ToolbarButton
                    label="H2"
                    active={editor?.isActive("heading", { level: 2 })}
                    disabled={!editor}
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  />
                  <ToolbarButton
                    label="H3"
                    active={editor?.isActive("heading", { level: 3 })}
                    disabled={!editor}
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                  />
                  <ToolbarButton
                    label="List"
                    active={editor?.isActive("bulletList")}
                    disabled={!editor}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  />
                  <ToolbarButton
                    label="Quote"
                    active={editor?.isActive("blockquote")}
                    disabled={!editor}
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  />
                  <EditorImageButton
                    editor={editor}
                    disabled={loading}
                    onError={setError}
                  />
                  <EditorVideoButton
                    editor={editor}
                    disabled={loading}
                    onError={setError}
                  />
                </div>
              ) : null}
              <EditorContent editor={editor} />
              {!isEditing ? (
                <ComposerMediaBar
                  editor={editor}
                  disabled={loading}
                  onError={setError}
                />
              ) : null}
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !editor}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading
              ? isEditing
                ? "Saving changes…"
                : "Scanning links and publishing..."
              : isEditing
                ? "Save changes"
                : "Publish"}
          </button>
          {isEditing && cancelHref ? (
            <Link href={cancelHref} className="text-sm text-muted link-accent">
              Cancel
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}

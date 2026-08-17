"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { EditorImageButton } from "@/components/editor-image-button";
import { COMMENT_SECTION } from "@/lib/api-section";
import { createEditorExtensions } from "@/lib/editor-extensions";
import {
  handleEditorImageFile,
  imageFileFromClipboard,
  imageFilesFromDrop,
} from "@/lib/editor-image-upload";
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

type CommentEditorInnerProps = {
  blogEntryId: string;
  parentId?: string | null;
  isSignedIn: boolean;
  heading?: string;
  submitLabel?: string;
  variant?: "default" | "inline";
  onCancel?: () => void;
  onPosted?: () => void;
};

export function CommentEditorInner({
  blogEntryId,
  parentId = null,
  isSignedIn,
  heading = "Comment",
  submitLabel = "Post comment",
  variant = "default",
  onCancel,
  onPosted,
}: CommentEditorInnerProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const isInline = variant === "inline";
  const editorMinHeight = isInline ? "min-h-[5rem]" : "min-h-[8rem]";

  const editor = useEditor({
    extensions: createEditorExtensions({
      placeholder: "Write a comment...",
    }),
    immediatelyRender: false,
    onCreate: ({ editor: created }) => {
      editorRef.current = created;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor ${editorMinHeight} px-3 py-2 focus:outline-none`,
      },
      handlePaste: (_view, event) => {
        const file = imageFileFromClipboard(event.clipboardData);
        const activeEditor = editorRef.current;
        if (!file || !activeEditor) {
          return false;
        }

        event.preventDefault();
        void handleEditorImageFile(activeEditor, file, setError);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = imageFilesFromDrop(event.dataTransfer);
        const activeEditor = editorRef.current;
        if (files.length === 0 || !activeEditor) {
          return false;
        }

        event.preventDefault();
        void handleEditorImageFile(activeEditor, files[0], setError);
        return true;
      },
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const content = editor.getHTML();
    const isEmpty = isEmptyEditorHtml(content, editor.getText());

    if (isEmpty) {
      setError("Add a comment before posting.");
      return;
    }

    setError("");
    setLoading(true);

    const response = await fetch(`/api/posts/${blogEntryId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: COMMENT_SECTION,
        content,
        parentId,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to post comment.");
      return;
    }

    editor.commands.clearContent();
    onPosted?.();
    router.refresh();
  };

  const sectionClass = isInline
    ? "mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950"
    : "surface-card mt-8";
  const headingClass = isInline
    ? "text-sm font-medium text-zinc-700 dark:text-zinc-300"
    : "text-lg font-semibold tracking-tight";

  if (!isSignedIn) {
    return (
      <section className={sectionClass}>
        <p className="text-sm text-muted">
          <Link href="/auth/login" className="link-accent">
            Sign in
          </Link>{" "}
          to comment.
        </p>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <h2 className={headingClass}>{heading}</h2>

      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <div>
          <div className="overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-600">
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
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={loading || !editor}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Posting…" : submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

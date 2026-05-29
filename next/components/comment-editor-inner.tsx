"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { COMMENT_SECTION } from "@/lib/api-section";

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
};

export function CommentEditorInner({
  blogEntryId,
  parentId = null,
  isSignedIn,
  heading = "Comment",
  submitLabel = "Post comment",
}: CommentEditorInnerProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[8rem] px-3 py-2 focus:outline-none",
      },
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const content = editor.getHTML();
    const isEmpty = !editor.getText().trim() || content === "<p></p>";

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
    router.refresh();
  };

  if (!isSignedIn) {
    return (
      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !editor}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Posting…" : submitLabel}
        </button>
      </form>
    </section>
  );
}

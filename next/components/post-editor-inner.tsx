"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

export function PostEditorInner() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[12rem] px-3 py-2 focus:outline-none",
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
      setError("Add some content before publishing.");
      return;
    }

    setError("");
    setLoading(true);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        content,
        status: "PUBLISHED",
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to publish post.");
      return;
    }

    setTitle("");
    editor.commands.clearContent();
    router.refresh();
  };

  return (
    <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold tracking-tight">New post</h2>
      <p className="mt-1 text-sm text-muted">
        Write and publish directly from the home page.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Title <span className="text-muted">(optional)</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field-input"
            placeholder="Post title"
          />
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium">Content</span>
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
          {loading ? "Scanning links and publishing..." : "Publish"}
        </button>
      </form>
    </section>
  );
}

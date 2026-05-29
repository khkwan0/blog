"use client";

import dynamic from "next/dynamic";

const CommentEditorInner = dynamic(
  () =>
    import("@/components/comment-editor-inner").then(
      (module) => module.CommentEditorInner,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold tracking-tight">Comment</h2>
        <p className="mt-4 text-sm text-muted">Loading editor…</p>
      </section>
    ),
  },
);

type CommentEditorProps = {
  blogEntryId: string;
  parentId?: string | null;
  isSignedIn: boolean;
  heading?: string;
  submitLabel?: string;
};

export function CommentEditor(props: CommentEditorProps) {
  return <CommentEditorInner {...props} />;
}

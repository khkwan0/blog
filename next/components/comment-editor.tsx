"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

function loadCommentEditorInner() {
  return import("@/components/comment-editor-inner").then(
    (module) => module.CommentEditorInner,
  );
}

const CommentEditorInner = dynamic(loadCommentEditorInner, {
  ssr: false,
  loading: () => (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold tracking-tight">Comment</h2>
      <p className="mt-4 text-sm text-muted">Loading editor…</p>
    </section>
  ),
});

type CommentEditorProps = {
  blogEntryId: string;
  parentId?: string | null;
  isSignedIn: boolean;
  heading?: string;
  submitLabel?: string;
};

export function CommentEditor(props: CommentEditorProps) {
  useEffect(() => {
    void loadCommentEditorInner();
  }, []);

  return <CommentEditorInner {...props} />;
}

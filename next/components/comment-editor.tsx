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
    <section className="surface-card mt-8">
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
  variant?: "default" | "inline";
  onCancel?: () => void;
  onPosted?: () => void;
};

export function CommentEditor(props: CommentEditorProps) {
  useEffect(() => {
    void loadCommentEditorInner();
  }, []);

  return <CommentEditorInner {...props} />;
}

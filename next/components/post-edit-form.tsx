"use client";

import dynamic from "next/dynamic";

const PostEditorInner = dynamic(
  () =>
    import("@/components/post-editor-inner").then(
      (module) => module.PostEditorInner,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="surface-card">
        <p className="text-sm text-muted">Loading editor…</p>
      </section>
    ),
  },
);

type PostEditFormProps = {
  postId: string;
  initialContent: string;
};

export function PostEditForm({ postId, initialContent }: PostEditFormProps) {
  return (
    <PostEditorInner
      postId={postId}
      initialContent={initialContent}
      cancelHref={`/post/${postId}`}
    />
  );
}

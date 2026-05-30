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
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
      cancelHref={`/blog/${postId}`}
    />
  );
}

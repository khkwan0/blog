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
      <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold tracking-tight">New post</h2>
        <p className="mt-4 text-sm text-muted">Loading editor…</p>
      </section>
    ),
  },
);

export function PostEditor() {
  return <PostEditorInner />;
}

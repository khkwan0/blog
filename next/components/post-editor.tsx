"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

function loadPostEditorInner() {
  return import("@/components/post-editor-inner").then(
    (module) => module.PostEditorInner,
  );
}

const PostEditorInner = dynamic(loadPostEditorInner, {
  ssr: false,
  loading: () => (
    <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-muted">Loading editor…</p>
    </section>
  ),
});

type PostEditorProps = {
  displayName: string;
  avatarImage?: string | null;
};

export function PostEditor({ displayName, avatarImage }: PostEditorProps) {
  useEffect(() => {
    void loadPostEditorInner();
  }, []);

  return (
    <PostEditorInner displayName={displayName} avatarImage={avatarImage} />
  );
}

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
    <section className="surface-card mb-10">
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

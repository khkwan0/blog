"use client";

import dynamic from "next/dynamic";

const ReplyEditorInner = dynamic(
  () =>
    import("@/components/reply-editor-inner").then(
      (module) => module.ReplyEditorInner,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold tracking-tight">Reply</h2>
        <p className="mt-4 text-sm text-muted">Loading editor…</p>
      </section>
    ),
  },
);

type ReplyEditorProps = {
  blogEntryId: string;
  isSignedIn: boolean;
};

export function ReplyEditor(props: ReplyEditorProps) {
  return <ReplyEditorInner {...props} />;
}

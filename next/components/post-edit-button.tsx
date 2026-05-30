"use client";

import dynamic from "next/dynamic";

export const PostEditButton = dynamic(
  () =>
    import("@/components/post-edit-button-inner").then(
      (module) => module.PostEditButtonInner,
    ),
  { ssr: false },
);

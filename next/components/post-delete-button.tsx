"use client";

import dynamic from "next/dynamic";

const PostDeleteButtonInner = dynamic(
  () =>
    import("@/components/post-delete-button-inner").then(
      (module) => module.PostDeleteButtonInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute top-4 right-4 z-20 h-8 w-8"
        aria-hidden="true"
      />
    ),
  },
);

type PostDeleteButtonProps = {
  postId: string;
  redirectTo?: string;
};

export function PostDeleteButton(props: PostDeleteButtonProps) {
  return <PostDeleteButtonInner {...props} />;
}

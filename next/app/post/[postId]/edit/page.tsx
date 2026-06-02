import EditPostPage from "@/app/blog/[blogId]/edit/page";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export const dynamic = "force-dynamic";

export default async function PostEditPage({ params }: PageProps) {
  const { postId } = await params;
  return EditPostPage({ params: Promise.resolve({ blogId: postId }) });
}

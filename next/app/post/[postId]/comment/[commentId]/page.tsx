import type { Metadata } from "next";
import CommentThreadPage, {
  generateMetadata as generateCommentMetadata,
} from "@/app/blog/[blogId]/comment/[commentId]/page";

type PageProps = {
  params: Promise<{ postId: string; commentId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId, commentId } = await params;
  return generateCommentMetadata({
    params: Promise.resolve({ blogId: postId, commentId }),
  });
}

export default async function PostCommentPage({ params }: PageProps) {
  const { postId, commentId } = await params;
  return CommentThreadPage({
    params: Promise.resolve({ blogId: postId, commentId }),
  });
}

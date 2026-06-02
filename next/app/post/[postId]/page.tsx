import type { Metadata } from "next";
import BlogPostPage, {
  generateMetadata as generateBlogMetadata,
} from "@/app/blog/[blogId]/page";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  return generateBlogMetadata({ params: Promise.resolve({ blogId: postId }) });
}

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;
  return BlogPostPage({ params: Promise.resolve({ blogId: postId }) });
}

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PostEditForm } from "@/components/post-edit-form";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";
import { getPostForEdit } from "@/lib/read/posts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ blogId: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { blogId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const post = await getPostForEdit(blogId, session.user.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader>
        <HeaderNav
          isSignedIn
          username={session.user.name}
          avatarImage={session.user.image}
        />
      </SiteHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href={`/blog/${post.id}`}
          className="text-sm text-muted link-accent"
        >
          ← Back to post
        </Link>

        <div className="mt-6">
          <PostEditForm postId={post.id} initialContent={post.content} />
        </div>
      </main>
    </div>
  );
}

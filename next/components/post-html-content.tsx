import { prepareHtmlLinks } from "@/lib/link-html";
import { renderRepliesHtml } from "@/lib/render-replies-html";

type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
};

type RepliesHtmlProps = {
  replies: Reply[];
};

export function RepliesHtml({ replies }: RepliesHtmlProps) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        Replies ({replies.length})
      </h2>
      <ul
        className="space-y-4"
        dangerouslySetInnerHTML={{ __html: renderRepliesHtml(replies) }}
      />
    </section>
  );
}

type PostHtmlContentProps = {
  html: string;
  className?: string;
};

export function PostHtmlContent({ html, className }: PostHtmlContentProps) {
  if (!html.trim()) {
    return null;
  }

  return (
    <div
      className={className ?? "post-content"}
      dangerouslySetInnerHTML={{ __html: prepareHtmlLinks(html) }}
    />
  );
}

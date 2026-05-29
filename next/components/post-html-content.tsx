import { prepareHtmlLinks } from "@/lib/link-html";

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

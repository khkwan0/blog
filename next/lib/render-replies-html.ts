import { escapeHtml, prepareHtmlLinks } from "@/lib/link-html";

type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function renderRepliesHtml(replies: Reply[]): string {
  return replies
    .map((reply) => {
      const meta = `${escapeHtml(reply.user.name)} · ${escapeHtml(formatDate(reply.createdAt))}`;

      return `<li class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <p class="text-sm text-zinc-500 dark:text-zinc-400">${meta}</p>
  <div class="post-content mt-2">${prepareHtmlLinks(reply.content)}</div>
</li>`;
    })
    .join("");
}

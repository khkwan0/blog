<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Data layer

- **Reads** for pages/SEO: `lib/read/*` only. Server components import from there, not `@/lib/prisma`.
- **Writes** from the browser: `app/api/*` routes call `lib/write/*` only (not Prisma in route handlers).
- `lib/process-post-videos.ts`, `lib/process-post-hashtags.ts`, and `lib/write/mentions.ts` are write helpers invoked from `lib/write/posts.ts`.
- API routes may use `lib/read/*` for validation before calling `lib/write/*`.

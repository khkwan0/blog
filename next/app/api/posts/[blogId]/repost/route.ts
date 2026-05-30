import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-session";
import { toggleRepost } from "@/lib/write/reposts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ blogId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId } = await context.params;
  const result = await toggleRepost(session.user.id, blogId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    reposted: result.reposted,
    totalReposts: result.totalReposts,
  });
}

import { NextResponse } from "next/server";
import { resolveFacebookEmbedDimensions } from "@/lib/facebook-embed-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }

  const dimensions = await resolveFacebookEmbedDimensions(url);

  return NextResponse.json(dimensions, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}

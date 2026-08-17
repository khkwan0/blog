import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-session";
import { uploadContentVideo } from "@/lib/write/content-videos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("video");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Video file is required." }, { status: 400 });
  }

  const result = await uploadContentVideo({
    userId: session.user.id,
    file,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url }, { status: result.status });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiSession } from "@/lib/api-session";
import {
  deleteHostedAvatarFiles,
  extensionFromUpload,
  isHostedAvatarUrl,
  MAX_AVATAR_BYTES,
  writeAvatarFile,
} from "@/lib/avatar-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ image: session.user.image ?? null });
}

export async function POST(request: Request) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Avatar file is required." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Avatar file is empty." }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { error: "Avatar must be 2 MB or smaller." },
      { status: 400 },
    );
  }

  const ext = extensionFromUpload(file);
  if (!ext) {
    return NextResponse.json(
      { error: "Use a supported image format." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await deleteHostedAvatarFiles(session.user.id);
  const { url } = await writeAvatarFile(session.user.id, ext, bytes);

  await auth.api.updateUser({
    headers: request.headers,
    body: { image: url },
  });

  return NextResponse.json({ image: url });
}

export async function DELETE(request: Request) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isHostedAvatarUrl(session.user.image)) {
    await deleteHostedAvatarFiles(session.user.id);
  }

  await auth.api.updateUser({
    headers: request.headers,
    body: { image: null },
  });

  return NextResponse.json({ image: null });
}

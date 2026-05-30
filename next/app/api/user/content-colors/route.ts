import { NextResponse } from "next/server";
import {
  getDefaultContentColors,
  normalizeHexColor,
} from "@/lib/content-colors";
import { getApiSession } from "@/lib/api-session";
import { getUserContentColors } from "@/lib/read/user-preferences";
import {
  resetUserContentColors,
  updateUserContentColors,
} from "@/lib/write/user-preferences";

export const dynamic = "force-dynamic";

type UpdateBody = {
  mentionColor?: string | null;
  hashtagColor?: string | null;
  reset?: boolean;
};

export async function GET() {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const colors = await getUserContentColors(session.user.id);
  const defaults = getDefaultContentColors();

  return NextResponse.json({
    mentionColor: colors?.mentionColor ?? null,
    hashtagColor: colors?.hashtagColor ?? null,
    defaults,
  });
}

export async function PATCH(request: Request) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateBody;

  if (body.reset) {
    const colors = await resetUserContentColors(session.user.id);
    return NextResponse.json(colors);
  }

  const mentionColor =
    body.mentionColor === null || body.mentionColor === undefined
      ? undefined
      : normalizeHexColor(body.mentionColor);
  const hashtagColor =
    body.hashtagColor === null || body.hashtagColor === undefined
      ? undefined
      : normalizeHexColor(body.hashtagColor);

  if (body.mentionColor !== undefined && body.mentionColor !== null) {
    if (!mentionColor) {
      return NextResponse.json(
        { error: "Mention color must be a valid hex color." },
        { status: 400 },
      );
    }
  }

  if (body.hashtagColor !== undefined && body.hashtagColor !== null) {
    if (!hashtagColor) {
      return NextResponse.json(
        { error: "Hashtag color must be a valid hex color." },
        { status: 400 },
      );
    }
  }

  const existing = await getUserContentColors(session.user.id);

  const colors = await updateUserContentColors(session.user.id, {
    mentionColor:
      mentionColor !== undefined
        ? mentionColor
        : (existing?.mentionColor ?? null),
    hashtagColor:
      hashtagColor !== undefined
        ? hashtagColor
        : (existing?.hashtagColor ?? null),
  });

  return NextResponse.json(colors);
}

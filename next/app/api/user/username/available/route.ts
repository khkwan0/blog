import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUsernameAvailable } from "@/lib/username-dictionary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? "";

  const result = await isUsernameAvailable(username, session.user.id);

  return NextResponse.json(result);
}

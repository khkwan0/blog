import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUniqueDictionaryUsername } from "@/lib/username-dictionary";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = await generateUniqueDictionaryUsername();

  return NextResponse.json({ username });
}

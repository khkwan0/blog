import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserDisplayName } from "@/lib/write/users";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };

  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  try {
    const user = await updateUserDisplayName(session.user.id, body.name);
    return NextResponse.json({
      name: user.name,
      username: user.username,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update display name.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

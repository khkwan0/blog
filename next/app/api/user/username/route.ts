import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserUsername } from "@/lib/write/users";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { username?: string };

  try {
    body = (await request.json()) as { username?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.username !== "string") {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  try {
    const user = await updateUserUsername(session.user.id, body.username);
    return NextResponse.json({
      username: user.username,
      name: user.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update username.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { completeUserProfileSetup } from "@/lib/write/users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; username?: string };

  try {
    body = (await request.json()) as { name?: string; username?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.name !== "string" || typeof body.username !== "string") {
    return NextResponse.json(
      { error: "Display name and username are required." },
      { status: 400 },
    );
  }

  try {
    const user = await completeUserProfileSetup(
      session.user.id,
      body.name,
      body.username,
    );

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: user.name,
        username: user.username,
        profileSetupComplete: true,
      },
    });

    return NextResponse.json({
      name: user.name,
      username: user.username,
      profileSetupComplete: user.profileSetupComplete,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

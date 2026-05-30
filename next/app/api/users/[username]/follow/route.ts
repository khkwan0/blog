import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-session";
import {
  followCounts,
  isFollowing,
} from "@/lib/read/social-graph";
import { findUserByUsername } from "@/lib/read/users";
import { followUser, unfollowUser } from "@/lib/write/social-graph";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ username: string }>;
};

async function resolveTarget(username: string) {
  return findUserByUsername(username);
}

export async function GET(_request: Request, context: RouteContext) {
  const { username } = await context.params;
  const target = await resolveTarget(username);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const session = await getApiSession();
  const counts = await followCounts(target.id);
  const following =
    session && session.user.id !== target.id
      ? await isFollowing(session.user.id, target.id)
      : false;

  return NextResponse.json({
    userId: target.id,
    username: target.name,
    ...counts,
    following,
    isSelf: session?.user.id === target.id,
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await context.params;
  const target = await resolveTarget(username);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot follow yourself." },
      { status: 400 },
    );
  }

  await followUser(session.user.id, target.id);

  const counts = await followCounts(target.id);

  return NextResponse.json({
    ...counts,
    following: true,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getApiSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await context.params;
  const target = await resolveTarget(username);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await unfollowUser(session.user.id, target.id);

  const counts = await followCounts(target.id);

  return NextResponse.json({
    ...counts,
    following: false,
  });
}

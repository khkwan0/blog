import { normalizeDisplayName, validateDisplayName } from "@/lib/display-name";
import { prisma } from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/username";

export async function updateUserDisplayName(userId: string, displayName: string) {
  const normalized = normalizeDisplayName(displayName);
  const validationError = validateDisplayName(normalized);

  if (validationError) {
    throw new Error(validationError);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name: normalized },
    select: {
      name: true,
      username: true,
    },
  });
}

export async function updateUserUsername(userId: string, nextUsername: string) {
  const normalized = normalizeUsername(nextUsername);
  const validationError = validateUsername(normalized);

  if (validationError) {
    throw new Error(validationError);
  }

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, name: true },
  });

  if (!current) {
    throw new Error("User not found.");
  }

  if (current.username === normalized) {
    return current;
  }

  const taken = await prisma.user.findFirst({
    where: {
      username: normalized,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (taken) {
    throw new Error("Username is already taken.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.blogEntryMention.updateMany({
      where: { userId },
      data: {
        username: normalized,
        display: `@${normalized}`,
      },
    });

    return tx.user.update({
      where: { id: userId },
      data: { username: normalized },
      select: {
        username: true,
        name: true,
      },
    });
  });
}

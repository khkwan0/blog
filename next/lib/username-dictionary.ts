import { prisma } from "@/lib/prisma";
import { normalizeUsername, USERNAME_MAX, validateUsername } from "@/lib/username";

const ADJECTIVES = [
  "amber",
  "brisk",
  "calm",
  "clever",
  "cosmic",
  "crisp",
  "daring",
  "eager",
  "gentle",
  "golden",
  "happy",
  "jolly",
  "kind",
  "lucky",
  "merry",
  "misty",
  "noble",
  "quiet",
  "rapid",
  "rusty",
  "shiny",
  "silent",
  "silver",
  "sunny",
  "swift",
  "vivid",
  "witty",
  "young",
  "zesty",
  "bright",
  "bold",
  "cool",
  "fair",
  "free",
  "grand",
  "keen",
  "light",
  "neat",
  "proud",
  "sharp",
  "smart",
  "warm",
  "wild",
  "wise",
] as const;

const NOUNS = [
  "badger",
  "beacon",
  "bison",
  "brook",
  "cedar",
  "comet",
  "coral",
  "crane",
  "delta",
  "eagle",
  "ember",
  "falcon",
  "fern",
  "finch",
  "flame",
  "fox",
  "harbor",
  "hawk",
  "heron",
  "isle",
  "jade",
  "lake",
  "lark",
  "leaf",
  "lynx",
  "maple",
  "meadow",
  "moon",
  "moss",
  "nova",
  "oak",
  "otter",
  "owl",
  "peak",
  "pine",
  "plum",
  "pond",
  "reef",
  "river",
  "robin",
  "stone",
  "storm",
  "tiger",
  "vale",
  "wave",
  "willow",
  "wolf",
] as const;

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Builds a handle from two dictionary words plus a numeric suffix (within username limits). */
export function buildDictionaryUsername() {
  const adjective = randomItem(ADJECTIVES);
  const noun = randomItem(NOUNS);
  const number = String(Math.floor(Math.random() * 9000) + 100);
  const raw = `${adjective}${noun}${number}`;
  return raw.slice(0, USERNAME_MAX);
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string,
) {
  const normalized = normalizeUsername(username);
  const validationError = validateUsername(normalized);

  if (validationError) {
    return { available: false, username: normalized, error: validationError };
  }

  const taken = await prisma.user.findFirst({
    where: {
      username: normalized,
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (taken) {
    return {
      available: false,
      username: normalized,
      error: "Username is already taken.",
    };
  }

  return { available: true, username: normalized, error: null };
}

export async function generateUniqueDictionaryUsername() {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = buildDictionaryUsername();
    const result = await isUsernameAvailable(candidate);
    if (result.available) {
      return result.username;
    }
  }

  const fallback = buildDictionaryUsername();
  return fallback.slice(0, USERNAME_MAX - 3) + String(Date.now() % 1000);
}

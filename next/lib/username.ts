export const USERNAME_MIN = 1;
export const USERNAME_MAX = 15;
const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);

  if (username.length < USERNAME_MIN) {
    return "Username is required.";
  }

  if (username.length > USERNAME_MAX) {
    return `Username must be at most ${USERNAME_MAX} characters.`;
  }

  if (/\s/.test(value)) {
    return "Username cannot include spaces.";
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Username may only contain letters, numbers, underscores, and periods.";
  }

  return null;
}

/** Generates a unique-looking handle within the 15-character limit (OAuth / phone sign-up). */
export function generateUsername(seed: string) {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "")
      .slice(0, 8) || "user";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`.slice(0, USERNAME_MAX);
}

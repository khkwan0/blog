export const DISPLAY_NAME_MIN = 1;
export const DISPLAY_NAME_MAX = 50;

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateDisplayName(value: string): string | null {
  const normalized = normalizeDisplayName(value);

  if (normalized.length < DISPLAY_NAME_MIN) {
    return "Display name is required.";
  }

  if (normalized.length > DISPLAY_NAME_MAX) {
    return `Display name must be at most ${DISPLAY_NAME_MAX} characters.`;
  }

  return null;
}

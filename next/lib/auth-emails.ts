/** Internal addresses used when Better Auth requires an email but the user has none. */
export const SYNTHETIC_USERNAME_EMAIL_SUFFIX = "@users.kkith.com";
export const SYNTHETIC_PHONE_EMAIL_SUFFIX = "@phone.kkith.com";

export function isSyntheticEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return (
    email.endsWith(SYNTHETIC_USERNAME_EMAIL_SUFFIX) ||
    email.endsWith(SYNTHETIC_PHONE_EMAIL_SUFFIX)
  );
}

export function syntheticEmailForUsername(username: string): string {
  return `${username.trim().toLowerCase()}${SYNTHETIC_USERNAME_EMAIL_SUFFIX}`;
}

export function syntheticEmailForPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `+${digits}${SYNTHETIC_PHONE_EMAIL_SUFFIX}`;
}

export function normalizePhoneNumber(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return trimmed;
  }

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function looksLikePhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function resolveSignUpEmail(
  username: string,
  email: string,
  phoneNumber: string,
): string {
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail) {
    return trimmedEmail;
  }

  const trimmedPhone = phoneNumber.trim();
  if (trimmedPhone) {
    return syntheticEmailForPhone(trimmedPhone);
  }

  return syntheticEmailForUsername(username);
}

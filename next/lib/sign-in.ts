import { authClient } from "@/lib/auth-client";
import {
  looksLikePhoneNumber,
  normalizePhoneNumber,
  syntheticEmailForUsername,
} from "@/lib/auth-emails";

type AuthClient = typeof authClient;

export async function signInWithIdentifier(
  client: AuthClient,
  identifier: string,
  password: string,
) {
  const trimmed = identifier.trim();

  if (looksLikePhoneNumber(trimmed)) {
    return client.signIn.phoneNumber({
      phoneNumber: normalizePhoneNumber(trimmed),
      password,
    });
  }

  if (trimmed.includes("@")) {
    return client.signIn.email({
      email: trimmed.toLowerCase(),
      password,
    });
  }

  return client.signIn.email({
    email: syntheticEmailForUsername(trimmed),
    password,
  });
}

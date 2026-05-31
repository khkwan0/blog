import type { BetterAuthOptions } from "better-auth";
import { importPKCS8, SignJWT } from "jose";

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

export type OAuthProviderId = "google" | "apple" | "github";

const PROVIDER_ORDER: OAuthProviderId[] = ["google", "apple", "github"];

async function generateAppleClientSecret(
  clientId: string,
  teamId: string,
  keyId: string,
  privateKey: string,
) {
  const key = await importPKCS8(privateKey.replace(/\\n/g, "\n"), "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

function isGithubConfigured() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim(),
  );
}

function isAppleConfigured() {
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  if (!clientId) {
    return false;
  }

  if (process.env.APPLE_CLIENT_SECRET?.trim()) {
    return true;
  }

  return Boolean(
    process.env.APPLE_TEAM_ID?.trim() &&
      process.env.APPLE_KEY_ID?.trim() &&
      process.env.APPLE_PRIVATE_KEY?.trim(),
  );
}

async function buildAppleProvider(): Promise<SocialProviders["apple"] | null> {
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  if (!clientId) {
    return null;
  }

  let clientSecret = process.env.APPLE_CLIENT_SECRET?.trim();
  if (!clientSecret) {
    const teamId = process.env.APPLE_TEAM_ID?.trim();
    const keyId = process.env.APPLE_KEY_ID?.trim();
    const privateKey = process.env.APPLE_PRIVATE_KEY?.trim();
    if (!teamId || !keyId || !privateKey) {
      return null;
    }

    clientSecret = await generateAppleClientSecret(
      clientId,
      teamId,
      keyId,
      privateKey,
    );
  }

  const appBundleIdentifier = process.env.APPLE_APP_BUNDLE_IDENTIFIER?.trim();

  return {
    clientId,
    clientSecret,
    ...(appBundleIdentifier ? { appBundleIdentifier } : {}),
  };
}

export async function getSocialProviders(): Promise<SocialProviders> {
  const providers: SocialProviders = {};

  if (isGoogleConfigured()) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
    };
  }

  const apple = await buildAppleProvider();
  if (apple) {
    providers.apple = apple;
  }

  if (isGithubConfigured()) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID!.trim(),
      clientSecret: process.env.GITHUB_CLIENT_SECRET!.trim(),
    };
  }

  return providers;
}

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  const configured = new Set<OAuthProviderId>();

  if (isGoogleConfigured()) {
    configured.add("google");
  }
  if (isAppleConfigured()) {
    configured.add("apple");
  }
  if (isGithubConfigured()) {
    configured.add("github");
  }

  return PROVIDER_ORDER.filter((provider) => configured.has(provider));
}

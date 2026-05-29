import type { BetterAuthOptions } from "better-auth";

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

export function getSocialProviders(): SocialProviders {
  const providers: SocialProviders = {};

  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (googleId && googleSecret) {
    providers.google = {
      clientId: googleId,
      clientSecret: googleSecret,
    };
  }

  const githubId = process.env.GITHUB_CLIENT_ID;
  const githubSecret = process.env.GITHUB_CLIENT_SECRET;
  if (githubId && githubSecret) {
    providers.github = {
      clientId: githubId,
      clientSecret: githubSecret,
    };
  }

  return providers;
}

export function getEnabledOAuthProviderIds(): Array<keyof SocialProviders> {
  return Object.keys(getSocialProviders()) as Array<keyof SocialProviders>;
}

export function getPublicOAuthProviderIds(): string[] {
  return (
    process.env.NEXT_PUBLIC_OAUTH_PROVIDERS?.split(",").map((value) => value.trim()) ??
    []
  ).filter(Boolean);
}

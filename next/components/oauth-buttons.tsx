"use client";

import { authClient } from "@/lib/auth-client";
import type { OAuthProviderId } from "@/lib/auth-providers";
import { OAuthProviderIcon } from "@/components/oauth-provider-icon";

const PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
};

type OAuthButtonsProps = {
  providers: string[];
  callbackURL?: string;
};

function isOAuthProviderId(provider: string): provider is OAuthProviderId {
  return provider === "google" || provider === "apple" || provider === "github";
}

export function OAuthButtons({
  providers,
  callbackURL = "/",
}: OAuthButtonsProps) {
  if (providers.length === 0) {
    return null;
  }

  const onOAuth = async (provider: OAuthProviderId) => {
    await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: "/auth/login",
    });
  };

  return (
    <div className="space-y-2">
      {providers.map((provider) => {
        if (!isOAuthProviderId(provider)) {
          return null;
        }

        return (
          <button
            key={provider}
            type="button"
            onClick={() => onOAuth(provider)}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <OAuthProviderIcon provider={provider} />
            <span>Continue with {PROVIDER_LABELS[provider]}</span>
          </button>
        );
      })}
    </div>
  );
}

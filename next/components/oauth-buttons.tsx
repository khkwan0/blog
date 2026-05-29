"use client";

import { authClient } from "@/lib/auth-client";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

type OAuthButtonsProps = {
  providers: string[];
  callbackURL?: string;
};

export function OAuthButtons({
  providers,
  callbackURL = "/",
}: OAuthButtonsProps) {
  if (providers.length === 0) {
    return null;
  }

  const onOAuth = async (provider: string) => {
    await authClient.signIn.social({
      provider: provider as "google" | "github",
      callbackURL,
    });
  };

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => onOAuth(provider)}
          className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Continue with {PROVIDER_LABELS[provider] ?? provider}
        </button>
      ))}
    </div>
  );
}

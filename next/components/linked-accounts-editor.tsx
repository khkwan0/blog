"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OAuthProviderIcon } from "@/components/oauth-provider-icon";
import { authClient } from "@/lib/auth-client";
import type { OAuthProviderId } from "@/lib/auth-providers";
import { isSyntheticEmail } from "@/lib/auth-emails";

const PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
};

type LinkedAccount = {
  id: string;
  providerId: string;
};

type LinkedAccountsEditorProps = {
  availableProviders: OAuthProviderId[];
  userEmail: string | null | undefined;
};

export function LinkedAccountsEditor({
  availableProviders,
  userEmail,
}: LinkedAccountsEditorProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    const response = await authClient.listAccounts();
    setLoading(false);

    if (response.error) {
      setError(response.error.message ?? "Unable to load connected accounts.");
      return;
    }

    setAccounts(response.data ?? []);
    setError("");
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const onLink = async (provider: OAuthProviderId) => {
    setBusyProvider(provider);
    setError("");

    const { error: linkError } = await authClient.linkSocial({
      provider,
      callbackURL: "/settings",
      errorCallbackURL: "/settings",
    });

    setBusyProvider(null);

    if (linkError) {
      setError(linkError.message ?? "Unable to connect account.");
    }
  };

  const onUnlink = async (providerId: string) => {
    setBusyProvider(providerId);
    setError("");

    const { error: unlinkError } = await authClient.unlinkAccount({
      providerId,
    });

    setBusyProvider(null);

    if (unlinkError) {
      setError(unlinkError.message ?? "Unable to disconnect account.");
      return;
    }

    await loadAccounts();
    router.refresh();
  };

  if (availableProviders.length === 0) {
    return null;
  }

  const linkedProviderIds = new Set(accounts.map((account) => account.providerId));
  const hasRealEmail = Boolean(userEmail && !isSyntheticEmail(userEmail));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Connect Google or Apple to sign in with the same profile. Accounts are
        linked when the provider email matches your account email.
      </p>

      {!hasRealEmail ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Add a real email address to this account before connecting Google or
          Apple (username-only and phone accounts use internal addresses).
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading connected accounts…</p>
      ) : (
        <ul className="space-y-2">
          {availableProviders.map((provider) => {
            const linked = linkedProviderIds.has(provider);

            return (
              <li
                key={provider}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <OAuthProviderIcon provider={provider} />
                  {PROVIDER_LABELS[provider]}
                </div>
                {linked ? (
                  <button
                    type="button"
                    disabled={busyProvider === provider}
                    onClick={() => void onUnlink(provider)}
                    className="text-sm text-muted hover:text-red-600 disabled:opacity-60 dark:hover:text-red-400"
                  >
                    {busyProvider === provider ? "…" : "Disconnect"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      !hasRealEmail || busyProvider === provider
                    }
                    onClick={() => void onLink(provider)}
                    className="text-sm link-accent disabled:opacity-60"
                  >
                    {busyProvider === provider ? "Connecting…" : "Connect"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

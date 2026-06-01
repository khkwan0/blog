"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isSyntheticEmail } from "@/lib/auth-emails";

type AccountEmailEditorProps = {
  initialEmail: string | null | undefined;
};

export function AccountEmailEditor({ initialEmail }: AccountEmailEditorProps) {
  const router = useRouter();
  const [email, setEmail] = useState(
    initialEmail && !isSyntheticEmail(initialEmail) ? initialEmail : "",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const displayEmail =
    initialEmail && !isSyntheticEmail(initialEmail) ? initialEmail : null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setLoading(false);
      setError("Email is required.");
      return;
    }

    const { error: updateError } = await authClient.changeEmail({
      newEmail: trimmed,
      callbackURL: "/settings",
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message ?? "Unable to update email.");
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        A verified email lets you link Google and Apple sign-in to this account.
      </p>

      {displayEmail ? (
        <p className="text-sm">
          Current email: <span className="font-medium">{displayEmail}</span>
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          {displayEmail ? "New email" : "Email address"}
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field-input"
          autoComplete="email"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : displayEmail ? "Change email" : "Add email"}
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { displayUsername } from "@/lib/format-username";
import { USERNAME_MAX, USERNAME_MIN } from "@/lib/username";

type UsernameEditorProps = {
  initialUsername: string;
};

export function UsernameEditor({ initialUsername }: UsernameEditorProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(initialUsername);
    setSavedUsername(initialUsername);
  }, [initialUsername]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/user/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to update username.");
      return;
    }

    const data = (await response.json()) as { username: string };
    setUsername(data.username);
    setSavedUsername(data.username);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Your username is your unique @handle for mentions, profile URLs, and
        sign-in. Up to {USERNAME_MAX} characters, no spaces.
      </p>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Username</span>
        <input
          type="text"
          required
          minLength={USERNAME_MIN}
          maxLength={USERNAME_MAX}
          pattern="[a-zA-Z0-9_.]+"
          title="Letters, numbers, underscores, and periods only — no spaces"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value.replace(/\s/g, "").toLowerCase())
          }
          className="field-input"
          autoComplete="username"
          spellCheck={false}
        />
      </label>
      {savedUsername ? (
        <p className="break-all text-sm text-muted">
          Profile URL: /user/{encodeURIComponent(savedUsername)} (
          {displayUsername(savedUsername)})
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || username.trim() === savedUsername.trim()}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save username"}
      </button>
    </form>
  );
}

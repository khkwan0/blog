"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { displayUsername } from "@/lib/format-username";
import {
  DISPLAY_NAME_MAX,
  normalizeDisplayName,
  validateDisplayName,
} from "@/lib/display-name";
import {
  normalizeUsername,
  USERNAME_MAX,
  USERNAME_MIN,
  validateUsername,
} from "@/lib/username";

type ProfileSetupFormProps = {
  initialDisplayName: string;
  initialUsername: string;
};

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; username: string }
  | { status: "unavailable"; username: string; error: string }
  | { status: "invalid"; error: string };

export function ProfileSetupForm({
  initialDisplayName,
  initialUsername,
}: ProfileSetupFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
  });
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async (value: string) => {
    const normalized = normalizeUsername(value);
    const validationError = validateUsername(normalized);

    if (validationError) {
      setAvailability({ status: "invalid", error: validationError });
      return;
    }

    setAvailability({ status: "checking" });

    const response = await fetch(
      `/api/user/username/available?username=${encodeURIComponent(normalized)}`,
    );
    const data = (await response.json()) as {
      available?: boolean;
      username?: string;
      error?: string | null;
    };

    if (!response.ok) {
      setAvailability({
        status: "invalid",
        error: data.error ?? "Unable to check username.",
      });
      return;
    }

    if (data.available) {
      setAvailability({
        status: "available",
        username: data.username ?? normalized,
      });
      return;
    }

    setAvailability({
      status: "unavailable",
      username: data.username ?? normalized,
      error: data.error ?? "Username is already taken.",
    });
  }, []);

  useEffect(() => {
    const normalized = normalizeUsername(username);
    if (!normalized) {
      setAvailability({ status: "idle" });
      return;
    }

    const timeout = window.setTimeout(() => {
      void checkAvailability(normalized);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [username, checkAvailability]);

  const onSuggestUsername = async () => {
    setSuggesting(true);
    setError("");

    const response = await fetch("/api/user/username/suggest");
    setSuggesting(false);

    if (!response.ok) {
      setError("Unable to suggest a username. Try again.");
      return;
    }

    const data = (await response.json()) as { username: string };
    setUsername(data.username);
  };

  const canSubmit =
    !loading &&
    availability.status === "available" &&
    normalizeUsername(username) === availability.username &&
    validateDisplayName(normalizeDisplayName(displayName)) === null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedName = normalizeDisplayName(displayName);
    const nameError = validateDisplayName(normalizedName);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!canSubmit) {
      setError("Choose an available username before continuing.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/user/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: normalizedName,
        username: availability.username,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to save your profile.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const availabilityMessage = (() => {
    switch (availability.status) {
      case "checking":
        return (
          <p className="text-sm text-muted">Checking availability…</p>
        );
      case "available":
        return (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {displayUsername(availability.username)} is available.
          </p>
        );
      case "unavailable":
        return (
          <p className="text-sm text-red-600">{availability.error}</p>
        );
      case "invalid":
        return <p className="text-sm text-red-600">{availability.error}</p>;
      default:
        return null;
    }
  })();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-muted">
        Choose how you appear on posts and pick a unique @username for your
        profile URL and mentions.
      </p>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Display name</span>
        <input
          type="text"
          required
          minLength={1}
          maxLength={DISPLAY_NAME_MAX}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="field-input"
          autoComplete="name"
        />
      </label>

      <div className="space-y-2">
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
        {availabilityMessage}
        <button
          type="button"
          onClick={() => void onSuggestUsername()}
          disabled={suggesting}
          className="text-sm link-accent disabled:opacity-60"
        >
          {suggesting ? "Suggesting…" : "Suggest a username"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

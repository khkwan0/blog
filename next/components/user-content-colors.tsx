"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentColorDefaults } from "@/lib/content-colors";

type UserContentColorsProps = {
  initialMentionColor: string | null;
  initialHashtagColor: string | null;
  defaults: ContentColorDefaults;
};

export function UserContentColors({
  initialMentionColor,
  initialHashtagColor,
  defaults,
}: UserContentColorsProps) {
  const router = useRouter();
  const [mentionColor, setMentionColor] = useState(
    initialMentionColor ?? defaults.mentionLight,
  );
  const [hashtagColor, setHashtagColor] = useState(
    initialHashtagColor ?? defaults.hashtagLight,
  );
  const [savedMentionColor, setSavedMentionColor] = useState(initialMentionColor);
  const [savedHashtagColor, setSavedHashtagColor] = useState(initialHashtagColor);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setError("");
    setLoading(true);

    const response = await fetch("/api/user/content-colors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentionColor,
        hashtagColor,
      }),
      credentials: "include",
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to save colors.");
      return;
    }

    const data = (await response.json()) as {
      mentionColor: string | null;
      hashtagColor: string | null;
    };

    setSavedMentionColor(data.mentionColor);
    setSavedHashtagColor(data.hashtagColor);
    router.refresh();
  };

  const onReset = async () => {
    setError("");
    setLoading(true);

    const response = await fetch("/api/user/content-colors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
      credentials: "include",
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to reset colors.");
      return;
    }

    setMentionColor(defaults.mentionLight);
    setHashtagColor(defaults.hashtagLight);
    setSavedMentionColor(null);
    setSavedHashtagColor(null);
    router.refresh();
  };

  return (
    <section className="surface-card mt-8">
      <h2 className="text-lg font-semibold tracking-tight">Mention & hashtag colors</h2>
      <p className="mt-1 text-sm text-muted">
        Choose how @mentions and #hashtags appear for you across the site.
      </p>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Mention color</span>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={mentionColor}
              onChange={(event) => setMentionColor(event.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
            />
            <span
              className="text-sm font-medium"
              style={{ color: mentionColor }}
            >
              @example
            </span>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Hashtag color</span>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={hashtagColor}
              onChange={(event) => setHashtagColor(event.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
            />
            <span
              className="text-sm font-medium"
              style={{ color: hashtagColor }}
            >
              #example
            </span>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void onSave()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save colors"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void onReset()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200"
        >
          Reset to defaults
        </button>
      </div>

      {savedMentionColor === null && savedHashtagColor === null ? (
        <p className="mt-3 text-sm text-muted">Using site default colors.</p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

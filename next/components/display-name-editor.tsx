"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DisplayNameEditorProps = {
  initialDisplayName: string;
};

export function DisplayNameEditor({ initialDisplayName }: DisplayNameEditorProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [savedName, setSavedName] = useState(initialDisplayName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setSavedName(initialDisplayName);
  }, [initialDisplayName]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/user/display-name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: displayName }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to update name.");
      return;
    }

    const data = (await response.json()) as { name: string };
    setDisplayName(data.name);
    setSavedName(data.name);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Your name is what people see on your profile and posts — up to 50
        characters, spaces and emoji allowed. It does not need to be unique.
      </p>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Name</span>
        <input
          type="text"
          required
          minLength={1}
          maxLength={50}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="field-input"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || displayName.trim() === savedName.trim()}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}

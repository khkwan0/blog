"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { IMAGE_ACCEPT, IMAGE_FORMAT_LABEL } from "@/lib/image-formats";

type AvatarEditorProps = {
  username: string;
  initialImage: string | null;
};

export function AvatarEditor({ username, initialImage }: AvatarEditorProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(initialImage);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onUpload = async (file: File) => {
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.set("avatar", file);

    const response = await fetch("/api/user/avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to upload avatar.");
      return;
    }

    const data = (await response.json()) as { image: string };
    setImage(data.image);
    router.refresh();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onUpload(file);
  };

  const onRemove = async () => {
    setError("");
    setLoading(true);

    const response = await fetch("/api/user/avatar", {
      method: "DELETE",
      credentials: "include",
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Unable to remove avatar.");
      return;
    }

    setImage(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <UserAvatar name={username} image={image} size="lg" />

      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={onFileChange}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Saving…" : image ? "Change avatar" : "Upload avatar"}
          </button>

          {image ? (
            <button
              type="button"
              disabled={loading}
              onClick={onRemove}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200"
            >
              Remove
            </button>
          ) : null}
        </div>

        <p className="text-sm text-muted">
          {IMAGE_FORMAT_LABEL}. Max 2 MB.
        </p>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

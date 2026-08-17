"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!token) {
      setError("Reset token is missing or invalid.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? "Unable to reset password.");
      return;
    }

    router.push("/auth/login");
  };

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">New password</span>
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        Back to{" "}
        <Link href="/auth/login" className="link-accent">
          sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="page-auth">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mt-2 text-sm text-muted">Choose a new password.</p>

      <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

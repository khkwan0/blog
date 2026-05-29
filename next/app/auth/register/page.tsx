"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthDivider } from "@/components/auth-divider";
import { OAuthButtons } from "@/components/oauth-buttons";
import { normalizePhoneNumber, resolveSignUpEmail } from "@/lib/auth-emails";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [awaitingPhoneOtp, setAwaitingPhoneOtp] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((response) => response.json())
      .then((config: { oauth?: string[] }) => {
        setOauthProviders(config.oauth ?? []);
      })
      .catch(() => setOauthProviders([]));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPhone = phoneNumber.trim()
      ? normalizePhoneNumber(phoneNumber)
      : "";
    const signUpEmail = resolveSignUpEmail(normalizedUsername, email, phoneNumber);

    const { error: signUpError } = await authClient.signUp.email({
      name: normalizedUsername,
      email: signUpEmail,
      password,
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message ?? "Unable to create account.");
      return;
    }

    if (normalizedPhone) {
      const { error: sendError } = await authClient.phoneNumber.sendOtp({
        phoneNumber: normalizedPhone,
      });

      setLoading(false);

      if (sendError) {
        setError(
          "Account created, but we could not send a phone verification code. You can verify your phone when signing in.",
        );
        router.push("/");
        router.refresh();
        return;
      }

      setPendingPhone(normalizedPhone);
      setAwaitingPhoneOtp(true);
      return;
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  };

  const onVerifyPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: pendingPhone,
      code: phoneOtp.trim(),
      updatePhoneNumber: true,
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid verification code.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-muted">
        Choose a username and password. Email and phone are optional.
      </p>

      {awaitingPhoneOtp ? (
        <form onSubmit={onVerifyPhone} className="mt-8 space-y-4">
          <p className="text-sm text-muted">
            Account created. Enter the code sent to {pendingPhone}.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Verification code
            </span>
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              value={phoneOtp}
              onChange={(event) => setPhoneOtp(event.target.value)}
              className="field-input"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify phone"}
          </button>
          <button
            type="button"
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            className="w-full text-sm text-muted hover:underline"
          >
            Skip for now
          </button>
        </form>
      ) : (
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Username</span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_.]+"
            title="Letters, numbers, underscores, and periods only"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Email <span className="text-muted">(optional)</span>
          </span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Phone <span className="text-muted">(optional)</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
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
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      )}

      {oauthProviders.length > 0 && !awaitingPhoneOtp ? (
        <>
          <AuthDivider />
          <OAuthButtons providers={oauthProviders} callbackURL="/" />
        </>
      ) : null}

      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        Already have an account?{" "}
        <Link href="/auth/login" className="link-accent">
          Sign in
        </Link>
      </p>
    </main>
  );
}

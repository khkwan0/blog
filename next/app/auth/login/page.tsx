"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { AuthOAuthError } from "@/components/auth-oauth-error";
import { AuthDivider } from "@/components/auth-divider";
import { OAuthButtons } from "@/components/oauth-buttons";
import { normalizePhoneNumber } from "@/lib/auth-emails";
import { authClient } from "@/lib/auth-client";
import { signInWithIdentifier } from "@/lib/sign-in";

type AuthMode = "password" | "phone";

function LoginPageContent() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("password");
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onOAuthError = useCallback((message: string) => {
    setError(message);
  }, []);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((response) => response.json())
      .then((config: { oauth?: string[] }) => {
        setOauthProviders(config.oauth ?? []);
      })
      .catch(() => setOauthProviders([]));
  }, []);

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signInWithIdentifier(
      authClient,
      identifier,
      password,
    );

    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Unable to sign in.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const onSendOtp = async () => {
    setError("");
    setLoading(true);

    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: normalizePhoneNumber(phoneNumber),
    });

    setLoading(false);

    if (sendError) {
      setError(sendError.message ?? "Unable to send code.");
      return;
    }

    setOtpSent(true);
  };

  const onPhoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!otpSent) {
      await onSendOtp();
      return;
    }

    setLoading(true);

    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: normalizePhoneNumber(phoneNumber),
      code: otpCode.trim(),
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="page-auth">
      <Suspense fallback={null}>
        <AuthOAuthError onMessage={onOAuthError} />
      </Suspense>
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Use a connected account, or sign in with email, username, or phone.
      </p>

      {oauthProviders.length > 0 ? (
        <div className="mt-6">
          <OAuthButtons providers={oauthProviders} />
          <AuthDivider />
        </div>
      ) : null}

      <div className={`flex gap-2 text-sm ${oauthProviders.length > 0 ? "mt-2" : "mt-6"}`}>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={
            mode === "password"
              ? "rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white"
              : "rounded-md px-3 py-1.5 text-muted hover:underline"
          }
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={
            mode === "phone"
              ? "rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white"
              : "rounded-md px-3 py-1.5 text-muted hover:underline"
          }
        >
          Phone code
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Email, username, or phone
            </span>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="field-input"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={onPhoneSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Phone number</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="+1 555 123 4567"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="field-input"
            />
          </label>

          {otpSent ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Verification code
              </span>
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                className="field-input"
              />
            </label>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : otpSent
                ? "Verify and sign in"
                : "Send code"}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/auth/register" className="link-accent">
          Create account
        </Link>
        <Link href="/auth/forgot-password" className="link-accent">
          Forgot password?
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}

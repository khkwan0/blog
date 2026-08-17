"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthDivider } from "@/components/auth-divider";
import { OAuthButtons } from "@/components/oauth-buttons";
import { normalizePhoneNumber, resolveSignUpEmail } from "@/lib/auth-emails";
import { authClient } from "@/lib/auth-client";
import {
  normalizeDisplayName,
  validateDisplayName,
} from "@/lib/display-name";
import {
  normalizeUsername,
  USERNAME_MAX,
  USERNAME_MIN,
  validateUsername,
} from "@/lib/username";

export default function RegisterPage() {
  const router = useRouter();
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
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

    const normalizedUsername = normalizeUsername(username);
    const normalizedPhone = phoneNumber.trim()
      ? normalizePhoneNumber(phoneNumber)
      : "";
    const signUpEmail = resolveSignUpEmail(normalizedUsername, email, phoneNumber);

    const normalizedDisplayName =
      normalizeDisplayName(displayName) || normalizedUsername;

    const usernameError = validateUsername(normalizedUsername);
    if (usernameError) {
      setLoading(false);
      setError(usernameError);
      return;
    }

    const displayNameError = validateDisplayName(normalizedDisplayName);
    if (displayNameError) {
      setLoading(false);
      setError(displayNameError);
      return;
    }

    const { error: signUpError } = await authClient.signUp.email({
      name: normalizedDisplayName,
      username: normalizedUsername,
      email: signUpEmail,
      password,
      profileSetupComplete: true,
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
    <main className="page-auth">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-muted">
        Continue with Google or Apple, or register with email and choose your
        @username and display name.
      </p>

      {oauthProviders.length > 0 && !awaitingPhoneOtp ? (
        <div className="mt-6">
          <OAuthButtons providers={oauthProviders} callbackURL="/" />
          <AuthDivider />
        </div>
      ) : null}

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
      <form
        onSubmit={onSubmit}
        className={`space-y-4 ${oauthProviders.length > 0 ? "mt-2" : "mt-8"}`}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Display name <span className="text-muted">(optional)</span>
          </span>
          <input
            type="text"
            maxLength={50}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="field-input"
            placeholder="Your name — spaces and emoji OK"
          />
          <p className="mt-1 text-xs text-muted">
            Up to 50 characters. Does not need to be unique.
          </p>
        </label>

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
            onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))}
            className="field-input"
            autoComplete="username"
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-muted">
            Up to {USERNAME_MAX} characters, no spaces. Used for @mentions and your
            profile URL. Must be unique.
          </p>
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

      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        Already have an account?{" "}
        <Link href="/auth/login" className="link-accent">
          Sign in
        </Link>
      </p>
    </main>
  );
}

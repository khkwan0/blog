"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function oauthErrorMessage(code: string | null) {
  switch (code) {
    case "account_not_linked":
      return "An account with this email already exists. Sign in with your password or phone, then connect Google or Apple in Settings.";
    case "email_doesn't_match":
    case "email_doesnt_match":
      return "That provider uses a different email than your account. Use the same email or sign in with your password first.";
    case "unable_to_link_account":
      return "We could not connect that sign-in method. Try signing in with email or password first.";
    default:
      return code
        ? `Sign-in failed (${code.replaceAll("_", " ")}).`
        : null;
  }
}

type AuthOAuthErrorProps = {
  onMessage: (message: string) => void;
};

export function AuthOAuthError({ onMessage }: AuthOAuthErrorProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = oauthErrorMessage(searchParams.get("error"));
    if (message) {
      onMessage(message);
    }
  }, [searchParams, onMessage]);

  return null;
}

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use same-origin in the browser to avoid localhost mismatches in production.
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const AUTH_PREFIX = "/auth";
const API_PREFIX = "/api";

export function ProfileSetupGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      pathname.startsWith(AUTH_PREFIX) ||
      pathname.startsWith(API_PREFIX)
    ) {
      return;
    }

    let cancelled = false;

    authClient.getSession().then((result) => {
      if (cancelled) {
        return;
      }

      const user = result.data?.user;
      if (user && user.profileSetupComplete === false) {
        router.replace("/auth/setup-profile");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return children;
}

import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { isDevBuild } from "@/lib/env";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Account",
  ...privatePageMetadata,
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div
        className={`fixed right-4 z-50 ${isDevBuild() ? "top-10" : "top-4"}`}
      >
        <ThemeSwitcher />
      </div>
      {children}
    </>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { DevBuildBanner } from "@/components/dev-build-banner";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserContentColorVars } from "@/components/user-content-color-vars";
import { isDevBuild } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shitsue",
  description: "Blog posts",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme")||"dark";if(t!=="light"&&t!=="dark")t="dark";document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add("dark")}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <UserContentColorVars />
        <ThemeProvider>
          <DevBuildBanner />
          <div
            className={`fixed right-4 z-50 ${isDevBuild() ? "top-10" : "top-4"}`}
          >
            <ThemeSwitcher />
          </div>
          <ProfileSetupGate>{children}</ProfileSetupGate>
        </ThemeProvider>
      </body>
    </html>
  );
}

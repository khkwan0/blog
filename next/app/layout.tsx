import type { Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { DevBuildBanner } from "@/components/dev-build-banner";
import { JsonLd } from "@/components/json-ld";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { ThemeProvider } from "@/components/theme-provider";
import { UserContentColorVars } from "@/components/user-content-color-vars";
import { defaultMetadata } from "@/lib/metadata";
import { absoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body className="flex min-h-full min-w-0 flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            description: siteConfig.description,
            url: absoluteUrl("/"),
          }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <UserContentColorVars />
        <ThemeProvider>
          <DevBuildBanner />
          <ProfileSetupGate>{children}</ProfileSetupGate>
        </ThemeProvider>
      </body>
    </html>
  );
}

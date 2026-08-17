import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

type SiteHeaderProps = {
  children: ReactNode;
  maxWidthClass?: "max-w-5xl" | "max-w-3xl";
};

export function SiteHeader({
  children,
  maxWidthClass = "max-w-3xl",
}: SiteHeaderProps) {
  return (
    <>
      <header className="relative z-10 overflow-visible border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div
          className={`relative mx-auto w-full min-w-0 ${maxWidthClass} px-4 pt-3 sm:px-6 sm:pt-4`}
        >
          <div className="flex items-center justify-between gap-3 pb-3 sm:justify-end sm:pb-6">
            <Link
              href="/"
              aria-label="Home"
              className="relative z-30 shrink-0 sm:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-600">
                <img
                  src="/shihtzu_with_round_text.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
            </Link>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {children}
              <ThemeSwitcher />
            </div>
          </div>
          <Link
            href="/"
            aria-label="Home"
            className="absolute bottom-0 left-6 z-30 hidden h-0 w-32 hover:opacity-90 sm:block"
          >
            <span className="absolute bottom-0 left-0 z-40 flex h-32 w-32 translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-600">
              <img
                src="/shihtzu_with_round_text.svg"
                alt=""
                width={128}
                height={128}
                className="h-full w-full object-contain"
              />
            </span>
          </Link>
        </div>
      </header>
      <div className="hidden h-16 shrink-0 sm:block" aria-hidden />
    </>
  );
}

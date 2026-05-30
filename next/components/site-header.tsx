import Link from "next/link";
import type { ReactNode } from "react";

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
        className={`relative mx-auto flex w-full ${maxWidthClass} items-center justify-between px-6 pb-6 pt-4 pr-36`}
      >
        <Link
          href="/"
          className="relative z-30 inline-flex min-h-10 items-end hover:text-accent"
        >
          <span
            className="absolute bottom-0 left-0 z-40 flex h-24 w-24 translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-600"
            aria-hidden
          >
            <img
              src="/shihtzu_with_round_text.svg"
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="relative mb-1 pl-[6.75rem] text-xl font-semibold tracking-tight">
            shitsue
          </span>
        </Link>
        <div className="relative z-20">{children}</div>
      </div>
    </header>
    <div className="h-12 shrink-0" aria-hidden />
  </>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" />
    </svg>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="shrink-0">
        <div
          className="h-8 w-8 rounded-md border border-zinc-300 sm:hidden dark:border-zinc-600"
          aria-hidden
        />
        <div
          className="hidden h-8 w-[7.25rem] rounded-md border border-zinc-300 sm:block dark:border-zinc-600"
          aria-hidden
        />
      </div>
    );
  }

  const active = theme === "light" ? "light" : "dark";

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setTheme(active === "light" ? "dark" : "light")}
        aria-label={
          active === "light" ? "Switch to dark theme" : "Switch to light theme"
        }
        title={active === "light" ? "Dark" : "Light"}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 sm:hidden dark:border-zinc-600 dark:text-zinc-300"
      >
        {active === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
      <div
        className="hidden rounded-md border border-zinc-300 p-0.5 text-xs font-medium sm:flex dark:border-zinc-600"
        role="group"
        aria-label="Theme"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={active === "light"}
          className={`rounded px-2.5 py-1 transition-colors ${
            active === "light"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={active === "dark"}
          className={`rounded px-2.5 py-1 transition-colors ${
            active === "dark"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Dark
        </button>
      </div>
    </div>
  );
}

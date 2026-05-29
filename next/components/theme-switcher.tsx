"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="h-8 w-[7.25rem] rounded-md border border-zinc-300 dark:border-zinc-600"
        aria-hidden
      />
    );
  }

  const active = theme === "light" ? "light" : "dark";

  return (
    <div
      className="flex rounded-md border border-zinc-300 p-0.5 text-xs font-medium dark:border-zinc-600"
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
  );
}

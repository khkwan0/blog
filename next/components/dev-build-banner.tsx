import { isDevBuild } from "@/lib/env";

export function DevBuildBanner() {
  if (!isDevBuild()) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-600/30 bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-amber-950 uppercase dark:border-amber-500/30 dark:bg-amber-500 dark:text-amber-950"
    >
      Development build
    </div>
  );
}

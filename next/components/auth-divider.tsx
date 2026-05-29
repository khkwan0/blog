export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-zinc-50 px-2 text-muted dark:bg-zinc-950">{label}</span>
      </div>
    </div>
  );
}

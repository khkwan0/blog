import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6">
      <main className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Blog Authentication
        </h1>
        <p className="mt-3 text-zinc-600">
          Credentials auth is now wired with Better Auth.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="rounded-md bg-emerald-600 px-4 py-2 text-center font-medium text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-md border border-zinc-300 px-4 py-2 text-center font-medium"
          >
            Register
          </Link>
          <Link
            href="/auth/forgot-password"
            className="rounded-md border border-zinc-300 px-4 py-2 text-center font-medium"
          >
            Forgot password
          </Link>
        </div>
      </main>
    </div>
  );
}

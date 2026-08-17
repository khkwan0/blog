import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileSetupForm } from "@/components/profile-setup-form";
import { auth } from "@/lib/auth";
import { generateUniqueDictionaryUsername } from "@/lib/username-dictionary";

export const dynamic = "force-dynamic";

export default async function SetupProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.profileSetupComplete !== false) {
    redirect("/");
  }

  const suggestedUsername = await generateUniqueDictionaryUsername();
  const initialDisplayName = session.user.name?.trim() || "";

  return (
    <main className="page-auth py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Set up your profile</h1>
      <p className="mt-2 text-sm text-muted">
        One more step before you can use the site.
      </p>

      <div className="surface-card mt-8">
        <ProfileSetupForm
          initialDisplayName={initialDisplayName}
          initialUsername={suggestedUsername}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/auth/login" className="link-accent">
          Sign out and use another account
        </Link>
      </p>
    </main>
  );
}

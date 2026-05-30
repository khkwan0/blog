import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvatarEditor } from "@/components/avatar-editor";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { UserContentColors } from "@/components/user-content-colors";
import { auth } from "@/lib/auth";
import { getDefaultContentColors } from "@/lib/content-colors";
import { getUserContentColors } from "@/lib/read/user-preferences";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const contentColors = await getUserContentColors(session.user.id);
  const defaults = getDefaultContentColors();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader>
        <HeaderNav
          isSignedIn
          username={session.user.name}
          avatarImage={session.user.image}
        />
      </SiteHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold tracking-tight">Avatar</h2>
          <div className="mt-6">
            <AvatarEditor
              username={session.user.name}
              initialImage={session.user.image ?? null}
            />
          </div>
        </section>

        <UserContentColors
          initialMentionColor={contentColors?.mentionColor ?? null}
          initialHashtagColor={contentColors?.hashtagColor ?? null}
          defaults={defaults}
        />
      </main>
    </div>
  );
}

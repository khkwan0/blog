import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountEmailEditor } from "@/components/account-email-editor";
import { AvatarEditor } from "@/components/avatar-editor";
import { DisplayNameEditor } from "@/components/display-name-editor";
import { LinkedAccountsEditor } from "@/components/linked-accounts-editor";
import { UsernameEditor } from "@/components/username-editor";
import { getEnabledOAuthProviderIds } from "@/lib/auth-providers";
import { isSyntheticEmail } from "@/lib/auth-emails";
import { HeaderNav } from "@/components/header-nav";
import { SiteHeader } from "@/components/site-header";
import { UserContentColors } from "@/components/user-content-colors";
import { auth } from "@/lib/auth";
import { privatePageMetadata } from "@/lib/metadata";
import { getDefaultContentColors } from "@/lib/content-colors";
import { getUserContentColors } from "@/lib/read/user-preferences";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  ...privatePageMetadata,
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const contentColors = await getUserContentColors(session.user.id);
  const defaults = getDefaultContentColors();
  const oauthProviders = getEnabledOAuthProviderIds();
  const showEmailSection = isSyntheticEmail(session.user.email);

  return (
    <div className="page-shell">
      <SiteHeader>
        <HeaderNav
          isSignedIn
          username={session.user.username ?? null}
          displayName={session.user.name}
          avatarImage={session.user.image}
        />
      </SiteHeader>

      <main className="page-main max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <section className="surface-card mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Name</h2>
          <div className="mt-6">
            <DisplayNameEditor initialDisplayName={session.user.name} />
          </div>
        </section>

        {showEmailSection || oauthProviders.length > 0 ? (
          <section className="surface-card mt-8">
            <h2 className="text-lg font-semibold tracking-tight">Sign-in methods</h2>
            {showEmailSection ? (
              <div className="mt-6 border-b border-zinc-200 pb-6 dark:border-zinc-700">
                <h3 className="text-sm font-medium">Email</h3>
                <div className="mt-4">
                  <AccountEmailEditor initialEmail={session.user.email} />
                </div>
              </div>
            ) : null}
            {oauthProviders.length > 0 ? (
              <div className={showEmailSection ? "mt-6" : "mt-6"}>
                {showEmailSection ? (
                  <h3 className="text-sm font-medium">Connected accounts</h3>
                ) : null}
                <div className={showEmailSection ? "mt-4" : undefined}>
                  <LinkedAccountsEditor
                    availableProviders={oauthProviders}
                    userEmail={session.user.email}
                  />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="surface-card mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Username</h2>
          <div className="mt-6">
            <UsernameEditor initialUsername={session.user.username ?? ""} />
          </div>
        </section>

        <section className="surface-card mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Avatar</h2>
          <div className="mt-6">
            <AvatarEditor
              username={session.user.username ?? ""}
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

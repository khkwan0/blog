import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { buildContentColorCss } from "@/lib/content-colors";
import { getUserContentColors } from "@/lib/read/user-preferences";

export async function UserContentColorVars() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const colors = await getUserContentColors(session.user.id);
  const css = buildContentColorCss(
    colors?.mentionColor ?? null,
    colors?.hashtagColor ?? null,
  );

  if (!css) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

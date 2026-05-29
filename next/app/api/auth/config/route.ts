import { getEnabledOAuthProviderIds } from "@/lib/auth-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    oauth: getEnabledOAuthProviderIds(),
    phone: true,
  });
}

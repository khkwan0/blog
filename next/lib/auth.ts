import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { syntheticEmailForPhone } from "@/lib/auth-emails";
import { getSocialProviders } from "@/lib/auth-providers";
import { prisma } from "@/lib/prisma";

const appUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

function trustedOrigins() {
  const values = [
    appUrl,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
  ];

  return [
    ...new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
        .map((value) => {
          try {
            return new URL(value).origin;
          } catch {
            return value;
          }
        }),
    ),
  ];
}

const socialProviders = getSocialProviders();

export const auth = betterAuth({
  baseURL: appUrl,
  trustedOrigins: trustedOrigins(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Replace this with your email provider integration.
      console.info(`Password reset for ${user.email}: ${url}`);
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }) => {
        // Replace with your SMS provider (Twilio, etc.).
        console.info(`OTP for ${phone}: ${code}`);
      },
      signUpOnVerification: {
        getTempEmail: (phone) => syntheticEmailForPhone(phone),
        getTempName: (phone) => phone.replace(/\D/g, "").slice(-8) || phone,
      },
    }),
  ],
});

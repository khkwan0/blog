import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { isSyntheticEmail, syntheticEmailForPhone } from "@/lib/auth-emails";
import {
  getEnabledOAuthProviderIds,
  getSocialProviders,
} from "@/lib/auth-providers";
import { prisma } from "@/lib/prisma";
import { generateUniqueDictionaryUsername } from "@/lib/username-dictionary";
import { normalizeUsername, validateUsername } from "@/lib/username";

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
    "https://appleid.apple.com",
  ];
}

const socialProviders = await getSocialProviders();
const oauthProviderIds = getEnabledOAuthProviderIds();

export const auth = betterAuth({
  baseURL: appUrl,
  trustedOrigins: trustedOrigins(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
        input: true,
      },
      profileSetupComplete: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = { ...user } as Record<string, unknown>;
          const rawUsername =
            typeof data.username === "string" ? data.username.trim() : "";
          const explicitUsername = rawUsername
            ? normalizeUsername(rawUsername)
            : "";
          let name = typeof data.name === "string" ? data.name.trim() : "";

          const profileSetupComplete =
            data.profileSetupComplete === true ||
            Boolean(explicitUsername && validateUsername(explicitUsername) === null);

          let username = explicitUsername;
          if (!username) {
            username = await generateUniqueDictionaryUsername();
          }

          const usernameError = validateUsername(username);
          if (usernameError) {
            throw new Error(usernameError);
          }

          if (!name) {
            name = username;
          }

          const email =
            typeof data.email === "string" ? data.email.toLowerCase() : "";
          const emailVerified =
            typeof data.emailVerified === "boolean"
              ? data.emailVerified
              : Boolean(email && !isSyntheticEmail(email));

          return {
            data: {
              ...data,
              username,
              name,
              email,
              emailVerified,
              profileSetupComplete,
            },
          };
        },
      },
    },
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: oauthProviderIds,
      // OAuth providers verify email ownership; allow linking to an existing
      // local account with the same address even if local email was never verified.
      requireLocalEmailVerified: false,
    },
  },
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

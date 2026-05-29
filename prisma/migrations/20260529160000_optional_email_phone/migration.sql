-- Email is optional; phone can be used for sign-in instead.
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- Add changeable display name; keep username as the stable @mention handle.
ALTER TABLE "User" ADD COLUMN "name" TEXT;

UPDATE "User" SET "name" = "username" WHERE "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

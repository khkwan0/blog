-- AlterTable
ALTER TABLE "BlogEntryMentions" ADD COLUMN IF NOT EXISTS "display" TEXT;

UPDATE "BlogEntryMentions"
SET "display" = "username"
WHERE "display" IS NULL;

ALTER TABLE "BlogEntryMentions" ALTER COLUMN "display" SET NOT NULL;

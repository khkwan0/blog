-- Backfill username from legacy name column, then drop name.
UPDATE "User" SET "username" = "name" WHERE "username" IS NULL AND "name" IS NOT NULL;

-- Any row still missing a username gets a stable placeholder from id.
UPDATE "User"
SET "username" = 'user_' || LEFT("id", 8)
WHERE "username" IS NULL;

ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

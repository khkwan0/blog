-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (
  CASE "role"
    WHEN 0 THEN 'USER'::"UserRole"
    WHEN 1 THEN 'MODERATOR'::"UserRole"
    WHEN 2 THEN 'ADMIN'::"UserRole"
    ELSE 'USER'::"UserRole"
  END
);

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";

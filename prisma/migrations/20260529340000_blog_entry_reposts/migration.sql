-- AlterTable
ALTER TABLE "BlogEntry" ADD COLUMN "totalReposts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BlogEntry" ADD COLUMN "repostedFromId" TEXT;

-- CreateIndex
CREATE INDEX "BlogEntry_repostedFromId_idx" ON "BlogEntry"("repostedFromId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogEntry_ownerId_repostedFromId_key" ON "BlogEntry"("ownerId", "repostedFromId");

-- AddForeignKey
ALTER TABLE "BlogEntry" ADD CONSTRAINT "BlogEntry_repostedFromId_fkey" FOREIGN KEY ("repostedFromId") REFERENCES "BlogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

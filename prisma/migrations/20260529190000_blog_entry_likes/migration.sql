-- AlterTable
ALTER TABLE "BlogEntry" ADD COLUMN "totalLikes" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "BlogEntryLike" (
    "id" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogEntryLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogEntryLike_userId_idx" ON "BlogEntryLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogEntryLike_blogEntryId_userId_key" ON "BlogEntryLike"("blogEntryId", "userId");

-- AddForeignKey
ALTER TABLE "BlogEntryLike" ADD CONSTRAINT "BlogEntryLike_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogEntryLike" ADD CONSTRAINT "BlogEntryLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

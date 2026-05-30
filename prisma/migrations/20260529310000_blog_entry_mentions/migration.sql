-- CreateTable
CREATE TABLE "BlogEntryMentions" (
    "id" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogEntryMentions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogEntryMentions_blogEntryId_idx" ON "BlogEntryMentions"("blogEntryId");

-- CreateIndex
CREATE INDEX "BlogEntryMentions_username_idx" ON "BlogEntryMentions"("username");

-- CreateIndex
CREATE INDEX "BlogEntryMentions_userId_idx" ON "BlogEntryMentions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogEntryMentions_blogEntryId_username_key" ON "BlogEntryMentions"("blogEntryId", "username");

-- AddForeignKey
ALTER TABLE "BlogEntryMentions" ADD CONSTRAINT "BlogEntryMentions_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogEntryMentions" ADD CONSTRAINT "BlogEntryMentions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

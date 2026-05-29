-- CreateTable
CREATE TABLE "BlogEntryReply" (
    "id" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogEntryReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogEntryReply_blogEntryId_createdAt_idx" ON "BlogEntryReply"("blogEntryId", "createdAt");

-- AddForeignKey
ALTER TABLE "BlogEntryReply" ADD CONSTRAINT "BlogEntryReply_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogEntryReply" ADD CONSTRAINT "BlogEntryReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

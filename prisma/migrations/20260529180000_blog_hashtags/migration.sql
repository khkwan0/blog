-- CreateTable
CREATE TABLE "HashTags" (
    "id" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "display" TEXT NOT NULL,

    CONSTRAINT "HashTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HashTags_hashtag_idx" ON "HashTags"("hashtag");

-- CreateIndex
CREATE INDEX "HashTags_blogEntryId_idx" ON "HashTags"("blogEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "HashTags_blogEntryId_hashtag_key" ON "HashTags"("blogEntryId", "hashtag");

-- AddForeignKey
ALTER TABLE "HashTags" ADD CONSTRAINT "HashTags_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "BlogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogEntryBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogEntryId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "BlogEntryBlock_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogEntry_slug_key" ON "BlogEntry"("slug");

-- CreateIndex
CREATE INDEX "BlogEntry_ownerId_createdAt_idx" ON "BlogEntry"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "BlogEntry_status_publishedAt_idx" ON "BlogEntry"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogEntryBlock_blogEntryId_idx" ON "BlogEntryBlock"("blogEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogEntryBlock_blogEntryId_sortOrder_key" ON "BlogEntryBlock"("blogEntryId", "sortOrder");

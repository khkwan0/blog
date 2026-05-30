-- CreateTable
CREATE TABLE "SocialGraph" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialGraph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialGraph_followerId_idx" ON "SocialGraph"("followerId");

-- CreateIndex
CREATE INDEX "SocialGraph_followingId_idx" ON "SocialGraph"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialGraph_followerId_followingId_key" ON "SocialGraph"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "SocialGraph" ADD CONSTRAINT "SocialGraph_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialGraph" ADD CONSTRAINT "SocialGraph_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

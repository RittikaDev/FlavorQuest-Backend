/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ratings_postId_idx";

-- DropIndex
DROP INDEX "ratings_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_postId_key" ON "ratings"("userId", "postId");

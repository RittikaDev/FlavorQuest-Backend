/*
  Warnings:

  - You are about to drop the column `isApproved` on the `food_posts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "food_posts" DROP COLUMN "isApproved",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PENDING';

/*
  Warnings:

  - Made the column `categoryId` on table `food_posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "food_posts" DROP CONSTRAINT "food_posts_categoryId_fkey";

-- AlterTable
ALTER TABLE "food_posts" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "food_posts" ADD CONSTRAINT "food_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

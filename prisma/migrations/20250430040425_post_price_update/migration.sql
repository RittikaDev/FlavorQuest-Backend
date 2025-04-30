/*
  Warnings:

  - You are about to drop the column `price` on the `food_posts` table. All the data in the column will be lost.
  - Added the required column `maxPrice` to the `food_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPrice` to the `food_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "food_posts" DROP COLUMN "price",
ADD COLUMN     "maxPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minPrice" DOUBLE PRECISION NOT NULL;

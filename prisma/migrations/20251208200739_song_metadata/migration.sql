/*
  Warnings:

  - You are about to drop the column `bigImage` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `smallImage` on the `Song` table. All the data in the column will be lost.
  - Made the column `channelName` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "bigImage",
DROP COLUMN "smallImage",
ADD COLUMN     "image" TEXT,
ALTER COLUMN "channelName" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE TEXT;

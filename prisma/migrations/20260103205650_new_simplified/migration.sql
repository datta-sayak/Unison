/*
  Warnings:

  - You are about to drop the column `themeId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `PlaybackHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlaybackHistory" DROP CONSTRAINT "PlaybackHistory_addedById_fkey";

-- DropForeignKey
ALTER TABLE "PlaybackHistory" DROP CONSTRAINT "PlaybackHistory_roomId_fkey";

-- DropForeignKey
ALTER TABLE "PlaybackHistory" DROP CONSTRAINT "PlaybackHistory_songId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropIndex
DROP INDEX "Room_accessMode_idx";

-- DropIndex
DROP INDEX "Room_createdAt_idx";

-- DropIndex
DROP INDEX "RoomUser_lastSeen_idx";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "themeId";

-- DropTable
DROP TABLE "PlaybackHistory";

-- DropTable
DROP TABLE "Vote";

-- DropEnum
DROP TYPE "QueueStatus";

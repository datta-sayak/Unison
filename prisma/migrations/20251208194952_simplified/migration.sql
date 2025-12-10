/*
  Warnings:

  - You are about to drop the `PlaybackState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlaybackHistory" DROP CONSTRAINT "PlaybackHistory_queueEntryId_fkey";

-- DropForeignKey
ALTER TABLE "PlaybackState" DROP CONSTRAINT "PlaybackState_currentEntryId_fkey";

-- DropForeignKey
ALTER TABLE "PlaybackState" DROP CONSTRAINT "PlaybackState_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomQueue" DROP CONSTRAINT "RoomQueue_addedById_fkey";

-- DropForeignKey
ALTER TABLE "RoomQueue" DROP CONSTRAINT "RoomQueue_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomQueue" DROP CONSTRAINT "RoomQueue_songId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_queueEntryId_fkey";

-- DropTable
DROP TABLE "PlaybackState";

-- DropTable
DROP TABLE "RoomQueue";

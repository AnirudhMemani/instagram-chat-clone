/*
  Warnings:

  - Made the column `isGroup` on table `ChatRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ALTER COLUMN "isGroup" SET NOT NULL;

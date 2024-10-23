/*
  Warnings:

  - You are about to drop the column `isGroup` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DirectMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AttachmentToMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DirectMessageToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('DIRECT_MESSAGE', 'GROUP');

-- DropForeignKey
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_latestMessageId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_superAdminId_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToMessage" DROP CONSTRAINT "_AttachmentToMessage_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToMessage" DROP CONSTRAINT "_AttachmentToMessage_B_fkey";

-- DropForeignKey
ALTER TABLE "_DirectMessageToUser" DROP CONSTRAINT "_DirectMessageToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_DirectMessageToUser" DROP CONSTRAINT "_DirectMessageToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupAdmin" DROP CONSTRAINT "_GroupAdmin_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupAdmin" DROP CONSTRAINT "_GroupAdmin_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupMembers" DROP CONSTRAINT "_GroupMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupMembers" DROP CONSTRAINT "_GroupMembers_B_fkey";

-- DropIndex
DROP INDEX "Message_senderId_chatRoomId_sentAt_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "isGroup",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "latestMessageId" TEXT,
ADD COLUMN     "nameUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "pictureUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "roomType" "RoomType" NOT NULL DEFAULT 'DIRECT_MESSAGE',
ADD COLUMN     "superAdminId" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "contentType",
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "chatRoomId" DROP NOT NULL;

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "DirectMessage";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "_AttachmentToMessage";

-- DropTable
DROP TABLE "_DirectMessageToUser";

-- DropTable
DROP TABLE "_GroupAdmin";

-- DropTable
DROP TABLE "_GroupMembers";

-- DropEnum
DROP TYPE "ContentType";

-- CreateTable
CREATE TABLE "_MessageRecipients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MessageRecipients_AB_unique" ON "_MessageRecipients"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageRecipients_B_index" ON "_MessageRecipients"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupAdmins_AB_unique" ON "_GroupAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupAdmins_B_index" ON "_GroupAdmins"("B");

-- CreateIndex
CREATE INDEX "ChatRoom_roomType_superAdminId_latestMessageId_idx" ON "ChatRoom"("roomType", "superAdminId", "latestMessageId");

-- CreateIndex
CREATE INDEX "Message_senderId_chatRoomId_editedAt_idx" ON "Message"("senderId", "chatRoomId", "editedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_email_key" ON "User"("username", "email");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_latestMessageId_fkey" FOREIGN KEY ("latestMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageRecipients" ADD CONSTRAINT "_MessageRecipients_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageRecipients" ADD CONSTRAINT "_MessageRecipients_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupAdmins" ADD CONSTRAINT "_GroupAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupAdmins" ADD CONSTRAINT "_GroupAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

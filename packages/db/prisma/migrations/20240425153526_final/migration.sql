/*
  Warnings:

  - You are about to drop the column `messageId` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `name` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_messageId_fkey";

-- DropIndex
DROP INDEX "Group_chatRoomId_key";

-- DropIndex
DROP INDEX "Group_superAdminId_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "messageId";

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_AttachmentToMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AttachmentToMessage_AB_unique" ON "_AttachmentToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_AttachmentToMessage_B_index" ON "_AttachmentToMessage"("B");

-- AddForeignKey
ALTER TABLE "_AttachmentToMessage" ADD CONSTRAINT "_AttachmentToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToMessage" ADD CONSTRAINT "_AttachmentToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

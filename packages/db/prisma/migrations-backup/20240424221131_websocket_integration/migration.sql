/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - Made the column `picture` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `editedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_chatRoomId_senderId_idx";

-- DropIndex
DROP INDEX "User_username_id_idx";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "createdAt",
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "picture" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "createdAt",
DROP COLUMN "read",
DROP COLUMN "updatedAt",
ADD COLUMN     "editedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "_MessageReadBy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageReceivedBy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MessageReadBy_AB_unique" ON "_MessageReadBy"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageReadBy_B_index" ON "_MessageReadBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageReceivedBy_AB_unique" ON "_MessageReceivedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageReceivedBy_B_index" ON "_MessageReceivedBy"("B");

-- CreateIndex
CREATE INDEX "Message_senderId_chatRoomId_idx" ON "Message"("senderId", "chatRoomId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- AddForeignKey
ALTER TABLE "_MessageReadBy" ADD CONSTRAINT "_MessageReadBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReadBy" ADD CONSTRAINT "_MessageReadBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReceivedBy" ADD CONSTRAINT "_MessageReceivedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReceivedBy" ADD CONSTRAINT "_MessageReceivedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

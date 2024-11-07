/*
  Warnings:

  - A unique constraint covering the columns `[latestMessageId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_latestMessageId_key" ON "ChatRoom"("latestMessageId");

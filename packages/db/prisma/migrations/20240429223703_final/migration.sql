/*
  Warnings:

  - A unique constraint covering the columns `[chatRoomId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_chatRoomId_key" ON "Group"("chatRoomId");

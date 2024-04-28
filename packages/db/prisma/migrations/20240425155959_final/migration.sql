-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "latestMessageId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DirectMessageToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_latestMessageId_key" ON "DirectMessage"("latestMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_chatRoomId_key" ON "DirectMessage"("chatRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "_DirectMessageToUser_AB_unique" ON "_DirectMessageToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DirectMessageToUser_B_index" ON "_DirectMessageToUser"("B");

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_latestMessageId_fkey" FOREIGN KEY ("latestMessageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DirectMessageToUser" ADD CONSTRAINT "_DirectMessageToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "DirectMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DirectMessageToUser" ADD CONSTRAINT "_DirectMessageToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

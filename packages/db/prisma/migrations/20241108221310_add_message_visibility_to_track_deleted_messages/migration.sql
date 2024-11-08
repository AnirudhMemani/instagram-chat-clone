-- CreateTable
CREATE TABLE "MessageVisibility" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "MessageVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageVisibility_userId_chatRoomId_idx" ON "MessageVisibility"("userId", "chatRoomId");

-- CreateIndex
CREATE INDEX "MessageVisibility_deletedAt_idx" ON "MessageVisibility"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageVisibility_chatRoomId_userId_key" ON "MessageVisibility"("chatRoomId", "userId");

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

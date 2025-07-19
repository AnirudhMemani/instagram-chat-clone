-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('DIRECT_MESSAGE', 'GROUP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profilePic" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageVisibility" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "MessageVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL,
    "chatRoomId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomType" "RoomType" NOT NULL DEFAULT 'DIRECT_MESSAGE',
    "name" TEXT,
    "picture" TEXT,
    "createdById" TEXT,
    "pictureUpdatedAt" TIMESTAMP(3),
    "nameUpdatedAt" TIMESTAMP(3),
    "superAdminId" TEXT,
    "latestMessageId" TEXT,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_MessageRecipients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatRoomParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_email_idx" ON "User"("username", "email");

-- CreateIndex
CREATE INDEX "MessageVisibility_userId_chatRoomId_idx" ON "MessageVisibility"("userId", "chatRoomId");

-- CreateIndex
CREATE INDEX "MessageVisibility_deletedAt_idx" ON "MessageVisibility"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageVisibility_chatRoomId_userId_key" ON "MessageVisibility"("chatRoomId", "userId");

-- CreateIndex
CREATE INDEX "Message_senderId_chatRoomId_editedAt_idx" ON "Message"("senderId", "chatRoomId", "editedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_latestMessageId_key" ON "ChatRoom"("latestMessageId");

-- CreateIndex
CREATE INDEX "ChatRoom_roomType_superAdminId_latestMessageId_idx" ON "ChatRoom"("roomType", "superAdminId", "latestMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageReadBy_AB_unique" ON "_MessageReadBy"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageReadBy_B_index" ON "_MessageReadBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageReceivedBy_AB_unique" ON "_MessageReceivedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageReceivedBy_B_index" ON "_MessageReceivedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageRecipients_AB_unique" ON "_MessageRecipients"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageRecipients_B_index" ON "_MessageRecipients"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomParticipants_AB_unique" ON "_ChatRoomParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomParticipants_B_index" ON "_ChatRoomParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupAdmins_AB_unique" ON "_GroupAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupAdmins_B_index" ON "_GroupAdmins"("B");

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_latestMessageId_fkey" FOREIGN KEY ("latestMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReadBy" ADD CONSTRAINT "_MessageReadBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReadBy" ADD CONSTRAINT "_MessageReadBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReceivedBy" ADD CONSTRAINT "_MessageReceivedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReceivedBy" ADD CONSTRAINT "_MessageReceivedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageRecipients" ADD CONSTRAINT "_MessageRecipients_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageRecipients" ADD CONSTRAINT "_MessageRecipients_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomParticipants" ADD CONSTRAINT "_ChatRoomParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomParticipants" ADD CONSTRAINT "_ChatRoomParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupAdmins" ADD CONSTRAINT "_GroupAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupAdmins" ADD CONSTRAINT "_GroupAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

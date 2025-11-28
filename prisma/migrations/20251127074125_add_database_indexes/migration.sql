-- CreateIndex
CREATE INDEX "Room_createdById_idx" ON "Room"("createdById");

-- CreateIndex
CREATE INDEX "Room_createdAt_idx" ON "Room"("createdAt");

-- CreateIndex
CREATE INDEX "Room_accessMode_idx" ON "Room"("accessMode");

-- CreateIndex
CREATE INDEX "RoomQueue_roomId_idx" ON "RoomQueue"("roomId");

-- CreateIndex
CREATE INDEX "RoomQueue_addedAt_idx" ON "RoomQueue"("addedAt");

-- CreateIndex
CREATE INDEX "RoomQueue_status_idx" ON "RoomQueue"("status");

-- CreateIndex
CREATE INDEX "RoomQueue_voteScore_idx" ON "RoomQueue"("voteScore");

-- CreateIndex
CREATE INDEX "RoomUser_roomId_idx" ON "RoomUser"("roomId");

-- CreateIndex
CREATE INDEX "RoomUser_userId_idx" ON "RoomUser"("userId");

-- CreateIndex
CREATE INDEX "RoomUser_lastSeen_idx" ON "RoomUser"("lastSeen");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

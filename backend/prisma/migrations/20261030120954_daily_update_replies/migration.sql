-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'DAILY_UPDATE_REPLY';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "dailyUpdateId" TEXT;

-- CreateTable
CREATE TABLE "daily_work_update_replies" (
    "id" TEXT NOT NULL,
    "dailyUpdateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_work_update_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_work_update_replies_dailyUpdateId_idx" ON "daily_work_update_replies"("dailyUpdateId");

-- CreateIndex
CREATE INDEX "daily_work_update_replies_authorId_idx" ON "daily_work_update_replies"("authorId");

-- AddForeignKey
ALTER TABLE "daily_work_update_replies" ADD CONSTRAINT "daily_work_update_replies_dailyUpdateId_fkey" FOREIGN KEY ("dailyUpdateId") REFERENCES "daily_work_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_work_update_replies" ADD CONSTRAINT "daily_work_update_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `task_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskEventType" AS ENUM ('TASK_CREATED', 'TASK_ASSIGNED', 'TASK_REASSIGNED', 'TASK_STARTED', 'TASK_PAUSED', 'TASK_RESUMED', 'TASK_BLOCKED', 'TASK_UNBLOCKED', 'TASK_COMPLETED', 'REVIEW_STARTED', 'REVIEW_COMPLETED', 'TASK_CLOSED', 'COMMENT_ADDED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ETA_CHANGED');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('STANDUP', 'SPRINT_PLANNING', 'SPRINT_REVIEW', 'CLIENT_MEETING', 'TECHNICAL_DISCUSSION', 'RCA', 'GENERAL');

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CONVERTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INTERVENTION_LOGGED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_BLOCKED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_UNBLOCKED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_ETA_APPROACHING';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'MOM_ACTION_ITEM_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'MOM_ACTION_ITEM_DUE_SOON';

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "task_history" DROP CONSTRAINT "task_history_taskId_fkey";

-- DropForeignKey
ALTER TABLE "task_history" DROP CONSTRAINT "task_history_userId_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "actionItemId" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "actionItemId" TEXT,
ADD COLUMN     "meetingId" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "task_history";

-- CreateTable
CREATE TABLE "task_activity" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "TaskEventType" NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_history" (
    "id" TEXT NOT NULL,
    "bugId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "bugId" TEXT,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL DEFAULT 'GENERAL',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "organizerId" TEXT,
    "description" TEXT,
    "momSummary" TEXT,
    "discussionPoints" TEXT,
    "decisionsMade" TEXT,
    "risksBlockers" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("meetingId","userId")
);

-- CreateTable
CREATE TABLE "meeting_action_items" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "status" "ActionItemStatus" NOT NULL DEFAULT 'OPEN',
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_action_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_activity_taskId_idx" ON "task_activity"("taskId");

-- CreateIndex
CREATE INDEX "task_activity_userId_idx" ON "task_activity"("userId");

-- CreateIndex
CREATE INDEX "task_activity_eventType_idx" ON "task_activity"("eventType");

-- CreateIndex
CREATE INDEX "task_activity_createdAt_idx" ON "task_activity"("createdAt");

-- CreateIndex
CREATE INDEX "bug_history_bugId_idx" ON "bug_history"("bugId");

-- CreateIndex
CREATE INDEX "bug_history_userId_idx" ON "bug_history"("userId");

-- CreateIndex
CREATE INDEX "bug_history_createdAt_idx" ON "bug_history"("createdAt");

-- CreateIndex
CREATE INDEX "interventions_taskId_idx" ON "interventions"("taskId");

-- CreateIndex
CREATE INDEX "interventions_bugId_idx" ON "interventions"("bugId");

-- CreateIndex
CREATE INDEX "interventions_employeeId_idx" ON "interventions"("employeeId");

-- CreateIndex
CREATE INDEX "interventions_createdAt_idx" ON "interventions"("createdAt");

-- CreateIndex
CREATE INDEX "meetings_projectId_idx" ON "meetings"("projectId");

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "meeting_participants_userId_idx" ON "meeting_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_action_items_taskId_key" ON "meeting_action_items"("taskId");

-- CreateIndex
CREATE INDEX "meeting_action_items_meetingId_idx" ON "meeting_action_items"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_action_items_assigneeId_idx" ON "meeting_action_items"("assigneeId");

-- CreateIndex
CREATE INDEX "comments_actionItemId_idx" ON "comments"("actionItemId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_actionItemId_fkey" FOREIGN KEY ("actionItemId") REFERENCES "meeting_action_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_activity" ADD CONSTRAINT "task_activity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_activity" ADD CONSTRAINT "task_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_history" ADD CONSTRAINT "bug_history_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_history" ADD CONSTRAINT "bug_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_action_items" ADD CONSTRAINT "meeting_action_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_action_items" ADD CONSTRAINT "meeting_action_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_action_items" ADD CONSTRAINT "meeting_action_items_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

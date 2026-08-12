-- CreateEnum: BugStatus
CREATE TYPE "BugStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'WONT_FIX');

-- CreateEnum: BugSeverity
CREATE TYPE "BugSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable: bugs
CREATE TABLE "bugs" (
    "id"               TEXT NOT NULL,
    "title"            TEXT NOT NULL,
    "description"      TEXT,
    "stepsToReproduce" TEXT,
    "expectedBehavior" TEXT,
    "actualBehavior"   TEXT,
    "environment"      TEXT,
    "status"           "BugStatus"    NOT NULL DEFAULT 'OPEN',
    "severity"         "BugSeverity"  NOT NULL DEFAULT 'MEDIUM',
    "priority"         "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "projectId"        TEXT,
    "assigneeId"       TEXT,
    "reporterId"       TEXT NOT NULL,
    "resolvedAt"       TIMESTAMP(3),
    "closedAt"         TIMESTAMP(3),
    "isArchived"       BOOLEAN NOT NULL DEFAULT false,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bugs_projectId_idx"   ON "bugs"("projectId");
CREATE INDEX "bugs_assigneeId_idx"  ON "bugs"("assigneeId");
CREATE INDEX "bugs_reporterId_idx"  ON "bugs"("reporterId");
CREATE INDEX "bugs_status_idx"      ON "bugs"("status");
CREATE INDEX "bugs_severity_idx"    ON "bugs"("severity");
CREATE INDEX "bugs_priority_idx"    ON "bugs"("priority");
CREATE INDEX "bugs_isArchived_idx"  ON "bugs"("isArchived");
CREATE INDEX "bugs_createdAt_idx"   ON "bugs"("createdAt");

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bugs" ADD CONSTRAINT "bugs_assigneeId_fkey"
  FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bugs" ADD CONSTRAINT "bugs_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

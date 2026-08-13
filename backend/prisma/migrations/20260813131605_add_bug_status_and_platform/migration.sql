-- CreateEnum
CREATE TYPE "BugPlatform" AS ENUM ('IOS', 'ANDROID', 'BACKEND', 'FRONTEND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BugStatus" ADD VALUE 'PENDING';
ALTER TYPE "BugStatus" ADD VALUE 'REOPENED';

-- AlterTable
ALTER TABLE "bugs" ADD COLUMN     "platform" "BugPlatform";

-- CreateIndex
CREATE INDEX "bugs_platform_idx" ON "bugs"("platform");

-- AddColumn: password (plain text) on users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;

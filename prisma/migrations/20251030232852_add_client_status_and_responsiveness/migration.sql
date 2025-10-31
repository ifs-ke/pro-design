-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "responsiveness" TEXT DEFAULT 'Warm',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Lead';

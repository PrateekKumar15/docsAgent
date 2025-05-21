-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

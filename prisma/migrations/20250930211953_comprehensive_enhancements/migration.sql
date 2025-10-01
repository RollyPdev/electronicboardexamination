-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."QType" ADD VALUE 'MULTIPLE_SELECT';
ALTER TYPE "public"."QType" ADD VALUE 'FILL_IN_BLANK';
ALTER TYPE "public"."QType" ADD VALUE 'MATCHING';
ALTER TYPE "public"."QType" ADD VALUE 'ESSAY';

-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "allowReview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "maxAttempts" INTEGER DEFAULT 1,
ADD COLUMN     "passingScore" DOUBLE PRECISION DEFAULT 60,
ADD COLUMN     "proctoringConfig" JSONB,
ADD COLUMN     "showResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."question_templates" (
    "id" TEXT NOT NULL,
    "type" "public"."QType" NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id")
);

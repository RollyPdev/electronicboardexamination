-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "correctAnswer" TEXT;

-- CreateTable
CREATE TABLE "public"."choices" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_answers" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "examResultId" TEXT NOT NULL,
    "selectedChoice" TEXT,
    "selectedChoiceId" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_examResultId_questionId_key" ON "public"."student_answers"("examResultId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."choices" ADD CONSTRAINT "choices_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "student_answers_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "public"."exam_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

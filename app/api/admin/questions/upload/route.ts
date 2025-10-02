import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { parseTextFile, parseDocxFile, validateQuestions, formatQuestionsForDatabase } from '@/lib/file-parser'

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const examId = formData.get('examId') as string

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (!examId) {
        return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
      }

      // Verify exam exists and user has permission
      const exam = await (prisma as any).exam.findFirst({
        where: { id: examId, creatorId: authReq.user!.id }
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      let parsingResult

      if (file.name.endsWith('.txt')) {
        const content = buffer.toString('utf-8')
        parsingResult = parseTextFile(content)
      } else if (file.name.endsWith('.docx')) {
        parsingResult = await parseDocxFile(buffer)
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Only .txt and .docx files are allowed.' }, { status: 400 })
      }

      if (parsingResult.errors.length > 0) {
        return NextResponse.json({
          error: 'Parsing errors found',
          details: parsingResult.errors,
          questions: parsingResult.questions
        }, { status: 400 })
      }

      const validationErrors = validateQuestions(parsingResult.questions)
      if (validationErrors.length > 0) {
        return NextResponse.json({
          error: 'Validation errors found',
          details: validationErrors,
          questions: parsingResult.questions
        }, { status: 400 })
      }

      // Format questions for database
      const formattedQuestions = formatQuestionsForDatabase(parsingResult.questions, examId)

      // Save questions to database
      const savedQuestions = []
      for (const questionData of formattedQuestions) {
        const question = await (prisma as any).question.create({
          data: {
            examId: questionData.examId,
            type: questionData.type,
            text: questionData.text,
            correctAnswer: questionData.correctAnswer,
            points: questionData.points,
            order: questionData.order,
          }
        })

        // Create choices
        for (const choiceData of questionData.choices) {
          await (prisma as any).choice.create({
            data: {
              questionId: question.id,
              text: choiceData.text,
              label: choiceData.label,
              isCorrect: choiceData.isCorrect,
              order: choiceData.order,
            }
          })
        }

        savedQuestions.push(question)
      }

      return NextResponse.json({
        message: 'Questions uploaded successfully',
        questionsCount: savedQuestions.length,
        questions: savedQuestions
      })

    } catch (error) {
      console.error('Error uploading questions:', error)
      return NextResponse.json(
        { error: 'Failed to upload questions' },
        { status: 500 }
      )
    }
  })
}
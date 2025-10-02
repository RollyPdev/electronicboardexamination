import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { parseTextFile, parseDocxFile, validateQuestions, formatQuestionsForDatabase } from '@/lib/file-parser'

// POST /api/admin/exams/[id]/upload-questions - Upload and parse question file
async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      
      // Check if exam exists and user has permission
      const exam = await (prisma as any).exam.findUnique({
        where: { id },
        include: { questions: true }
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Check if user is the creator or admin
      if (exam.creatorId !== authReq.user!.id && authReq.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      const formData = await req.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: 'Invalid file type. Please upload .txt or .docx files only.' 
        }, { status: 400 })
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'File too large. Maximum size is 10MB.' 
        }, { status: 400 })
      }

      let parseResult

      try {
        if (file.type === 'text/plain') {
          // Parse text file
          const content = await file.text()
          parseResult = parseTextFile(content)
        } else {
          // Parse DOCX file
          const buffer = Buffer.from(await file.arrayBuffer())
          parseResult = await parseDocxFile(buffer)
        }
      } catch (parseError) {
        console.error('Error parsing file:', parseError)
        return NextResponse.json({ 
          error: 'Failed to parse file. Please check the file format.' 
        }, { status: 400 })
      }

      // Validate parsed questions
      const validationErrors = validateQuestions(parseResult.questions)
      
      if (validationErrors.length > 0) {
        return NextResponse.json({
          error: 'Validation errors found',
          details: validationErrors,
          parsedQuestions: parseResult.questions.length
        }, { status: 400 })
      }

      if (parseResult.questions.length === 0) {
        return NextResponse.json({ 
          error: 'No valid questions found in the file' 
        }, { status: 400 })
      }

      // Check if there are existing questions
      const existingQuestionsCount = exam.questions.length
      const shouldReplace = formData.get('replace') === 'true'

      if (existingQuestionsCount > 0 && !shouldReplace) {
        return NextResponse.json({
          error: 'Exam already has questions. Use replace=true to replace existing questions.',
          existingCount: existingQuestionsCount,
          newCount: parseResult.questions.length
        }, { status: 400 })
      }

      // Start transaction
      const result = await (prisma as any).$transaction(async (tx: any) => {
        // Delete existing questions if replacing
        if (shouldReplace && existingQuestionsCount > 0) {
          // Delete existing choices first (due to foreign key constraints)
          await tx.choice.deleteMany({
            where: { question: { examId: id } }
          })
          
          // Delete existing student answers
          await tx.studentAnswer.deleteMany({
            where: { question: { examId: id } }
          })
          
          // Delete existing questions
          await tx.question.deleteMany({
            where: { examId: id }
          })
        }

        // Format questions for database
        const formattedQuestions = formatQuestionsForDatabase(parseResult.questions, id)

        // Create questions and choices
        const createdQuestions = []
        
        for (const questionData of formattedQuestions) {
          // Create the question
          const question = await tx.question.create({
            data: {
              examId: questionData.examId,
              type: questionData.type,
              text: questionData.text,
              correctAnswer: questionData.correctAnswer,
              points: questionData.points,
              order: questionData.order
            }
          })

          // Create choices for the question
          const choices = await Promise.all(
            questionData.choices.map(choiceData =>
              tx.choice.create({
                data: {
                  questionId: question.id,
                  text: choiceData.text,
                  label: choiceData.label,
                  isCorrect: choiceData.isCorrect,
                  order: choiceData.order
                }
              })
            )
          )

          createdQuestions.push({
            ...question,
            choices
          })
        }

        return {
          questions: createdQuestions,
          totalCreated: createdQuestions.length,
          replaced: shouldReplace,
          previousCount: existingQuestionsCount
        }
      })

      return NextResponse.json({
        success: true,
        message: `Successfully ${shouldReplace ? 'replaced' : 'added'} ${result.totalCreated} questions`,
        data: {
          questionsCreated: result.totalCreated,
          previousCount: result.previousCount,
          replaced: result.replaced,
          parsingErrors: parseResult.errors,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        }
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

export { POST }





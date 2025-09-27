#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkQuestionAnswers() {
  try {
    console.log('🔍 Checking questions for correct answers...\n')

    const questions = await prisma.question.findMany({
      include: {
        exam: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${questions.length} questions in database\n`)

    if (questions.length === 0) {
      console.log('❌ No questions found in database')
      return
    }

    let questionsWithAnswers = 0
    let questionsWithoutAnswers = 0

    questions.forEach((question, index) => {
      console.log(`${index + 1}. "${question.text.substring(0, 80)}${question.text.length > 80 ? '...' : ''}"`)
      console.log(`   Exam: "${question.exam.title}"`)
      console.log(`   Type: ${question.type}`)
      console.log(`   Points: ${question.points}`)
      
      const options = question.options
      let hasCorrectAnswer = false
      
      if (options) {
        console.log(`   Options:`, JSON.stringify(options, null, 2))
        
        // Check for correct answers based on question type
        switch (question.type) {
          case 'MCQ':
          case 'TRUE_FALSE':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => opt.correct === true)
            break
          case 'NUMERIC':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => 
              opt.correct_answer !== undefined || opt.correctAnswer !== undefined
            )
            break
          case 'SHORT_ANSWER':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => 
              opt.sample_answer || opt.sampleAnswer
            )
            break
        }
      }
      
      if (hasCorrectAnswer) {
        console.log(`   ✅ Has correct answer`)
        questionsWithAnswers++
      } else {
        console.log(`   ❌ Missing correct answer`)
        questionsWithoutAnswers++
      }
      console.log('')
    })

    // Summary
    console.log('📈 Summary:')
    console.log(`   ✅ Questions with correct answers: ${questionsWithAnswers}`)
    console.log(`   ❌ Questions without correct answers: ${questionsWithoutAnswers}`)
    console.log(`   📊 Coverage: ${((questionsWithAnswers / questions.length) * 100).toFixed(1)}%`)

    // Type breakdown
    const typeBreakdown = questions.reduce((acc, q) => {
      if (!acc[q.type]) acc[q.type] = { total: 0, withAnswers: 0 }
      acc[q.type].total++
      
      const options = q.options
      let hasCorrectAnswer = false
      
      if (options) {
        switch (q.type) {
          case 'MCQ':
          case 'TRUE_FALSE':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => opt.correct === true)
            break
          case 'NUMERIC':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => 
              opt.correct_answer !== undefined || opt.correctAnswer !== undefined
            )
            break
          case 'SHORT_ANSWER':
            hasCorrectAnswer = Array.isArray(options) && options.some(opt => 
              opt.sample_answer || opt.sampleAnswer
            )
            break
        }
      }
      
      if (hasCorrectAnswer) acc[q.type].withAnswers++
      return acc
    }, {})

    console.log('\n📋 By Question Type:')
    Object.entries(typeBreakdown).forEach(([type, stats]) => {
      console.log(`   ${type}: ${stats.withAnswers}/${stats.total} (${((stats.withAnswers/stats.total)*100).toFixed(1)}%)`)
    })

  } catch (error) {
    console.error('❌ Error checking questions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkQuestionAnswers()
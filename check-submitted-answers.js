#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSubmittedAnswers() {
  try {
    console.log('🔍 Checking for submitted answers in database...\n')

    // Check exam results with answers
    const examResults = await prisma.examResult.findMany({
      where: {
        answers: {
          not: null
        }
      },
      include: {
        exam: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    console.log(`📊 Found ${examResults.length} exam results with answers\n`)

    if (examResults.length === 0) {
      console.log('❌ No submitted answers found in database')
      return
    }

    // Display results
    examResults.forEach((result, index) => {
      console.log(`${index + 1}. Exam: "${result.exam.title}"`)
      console.log(`   Student: ${result.user.name} (${result.user.email})`)
      console.log(`   Status: ${result.status}`)
      console.log(`   Score: ${result.score || 'Not graded'}/${result.maxScore || 'Unknown'}`)
      console.log(`   Submitted: ${result.submittedAt || 'Not submitted'}`)
      
      // Count answers
      const answers = result.answers || {}
      const answerCount = Object.keys(answers).length
      console.log(`   Answers: ${answerCount} questions answered`)
      
      if (answerCount > 0) {
        console.log(`   Sample answers:`)
        Object.entries(answers).slice(0, 3).forEach(([questionId, answer]) => {
          console.log(`     - Question ${questionId}: "${answer.answer}"`)
        })
      }
      console.log('')
    })

    // Summary statistics
    const statusCounts = examResults.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1
      return acc
    }, {})

    console.log('📈 Status Summary:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })

    const gradedResults = examResults.filter(r => r.score !== null)
    if (gradedResults.length > 0) {
      const avgScore = gradedResults.reduce((sum, r) => sum + (r.score || 0), 0) / gradedResults.length
      console.log(`\n📊 Average Score: ${avgScore.toFixed(2)}`)
    }

  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubmittedAnswers()
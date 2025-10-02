'use client'

import { useState, useEffect } from 'react'
import { ExamInterface } from '@/components/student/exam-interface'
import { useRouter } from 'next/navigation'

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState([])
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchExamData()
  }, [params.id])

  const fetchExamData = async () => {
    try {
      // Start the exam and get questions
      const startResponse = await fetch(`/api/student/exams/${params.id}/start`, {
        method: 'POST'
      })
      
      if (!startResponse.ok) {
        throw new Error('Failed to start exam')
      }
      
      const startData = await startResponse.json()
      setToken(startData.token)
      
      // Get exam questions
      const examResponse = await fetch(`/api/student/exams/${params.id}`)
      const examData = await examResponse.json()
      
      if (examResponse.ok) {
        setQuestions(examData.exam.questions || [])
      }
    } catch (error) {
      console.error('Error fetching exam data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExamComplete = async () => {
    try {
      const response = await fetch(`/api/student/exams/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      
      if (response.ok) {
        const result = await response.json()
        router.push(`/student/results/${result.resultId}`)
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading exam...</div>
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">No questions available</div>
  }

  return (
    <ExamInterface
      examId={params.id}
      questions={questions}
      token={token}
      onComplete={handleExamComplete}
    />
  )
}
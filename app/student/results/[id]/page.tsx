'use client'

import { ExamResults } from '@/components/student/exam-results'

export default function StudentResultsPage({ params }: { params: { id: string } }) {
  return <ExamResults resultId={params.id} />
}
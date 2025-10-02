'use client'

import { useState } from 'react'
import { QuestionUpload } from '@/components/admin/question-upload'
import { QuestionsList } from '@/components/admin/questions-list'

export default function ExamQuestionsPage({ params }: { params: { id: string } }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Questions</h1>
      
      <QuestionUpload 
        examId={params.id} 
        onUploadComplete={handleUploadComplete}
      />
      
      <QuestionsList 
        examId={params.id} 
        refresh={refreshKey}
      />
    </div>
  )
}
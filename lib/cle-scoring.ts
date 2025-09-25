export interface CLESubject {
  name: string
  score: number
  weight: number
}

export interface CLEResult {
  subjects: CLESubject[]
  generalAverage: number
  status: 'PASS' | 'DEFERRED' | 'FAIL'
  message: string
  retakeSubjects?: string[]
}

export const CLE_SUBJECTS = [
  { name: 'Criminal Jurisprudence, Procedure and Evidence', weight: 20 },
  { name: 'Law Enforcement Administration', weight: 20 },
  { name: 'Criminalistics', weight: 20 },
  { name: 'Crime Detection and Investigation', weight: 15 },
  { name: 'Criminology', weight: 10 },
  { name: 'Correctional Administration', weight: 15 }
]

export function calculateCLEResult(scores: Record<string, number>, isAdminView: boolean = false): CLEResult {
  const subjects: CLESubject[] = CLE_SUBJECTS.map(subject => ({
    name: subject.name,
    score: scores[subject.name] || 0,
    weight: subject.weight
  }))

  // Calculate weighted scores
  const weightedScores = subjects.map(subject => 
    (subject.score * subject.weight) / 100
  )

  const generalAverage = Math.round(weightedScores.reduce((sum, score) => sum + score, 0) * 100) / 100

  // Check subjects below 50%
  const failedSubjects = subjects.filter(subject => subject.score < 50)
  const failedCount = failedSubjects.length

  let status: 'PASS' | 'DEFERRED' | 'FAIL'
  let message: string
  let retakeSubjects: string[] | undefined

  if (generalAverage >= 75 && failedCount === 0) {
    status = 'PASS'
    message = isAdminView 
      ? '✅ PASS (This student successfully passed the Mock Board Exam!)'
      : '✅ PASS (Congratulations! You successfully passed the Mock Board Exam for Criminologist Licensure Examinations!)'
  } else if (generalAverage >= 75 && failedCount <= 2) {
    status = 'DEFERRED'
    retakeSubjects = failedSubjects.map(s => s.name)
    message = isAdminView
      ? `⚠️ DEFERRED – This student must retake: ${retakeSubjects.join(', ')}`
      : `⚠️ DEFERRED – You must retake: ${retakeSubjects.join(', ')}`
  } else {
    status = 'FAIL'
    message = isAdminView
      ? '❌ FAIL – This student must retake the entire CLE Mock Board Exam.'
      : '❌ FAIL – You must retake the entire CLE Mock Board Exam.'
  }

  return {
    subjects,
    generalAverage,
    status,
    message,
    retakeSubjects
  }
}

export function formatCLETable(result: CLEResult): string {
  const header = 'Subject                                 | Score | Weight | Weighted Score\n' +
                '-'.repeat(75)
  
  const rows = result.subjects.map(subject => {
    const weightedScore = (subject.score * subject.weight / 100).toFixed(2)
    return `${subject.name.padEnd(39)} | ${subject.score.toString().padStart(5)} | ${subject.weight.toString().padStart(4)}%  | ${weightedScore.padStart(6)}`
  }).join('\n')

  const footer = '-'.repeat(75) + '\n' +
                `General Average: ${result.generalAverage}%\n` +
                `Result: ${result.message}`

  return `${header}\n${rows}\n${footer}`
}
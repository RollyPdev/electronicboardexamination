# Automatic Grading System

## Overview

The e-BES system includes a comprehensive automatic grading system that evaluates student answers and provides immediate feedback. The system supports multiple question types and automatically calculates scores while identifying questions that need manual review.

## Supported Question Types

### 1. Multiple Choice Questions (MCQ)
- **Format**: Questions with 2-4 options (A, B, C, D)
- **Grading**: Exact match with the correct option
- **Storage**: Options stored with `correct: true/false` flag
- **Example**:
```json
{
  "type": "MCQ",
  "text": "What is the capital of France?",
  "options": [
    { "label": "A", "text": "London", "correct": false },
    { "label": "B", "text": "Paris", "correct": true },
    { "label": "C", "text": "Berlin", "correct": false }
  ]
}
```

### 2. True/False Questions
- **Format**: Binary choice questions
- **Grading**: Exact match with correct answer
- **Storage**: Two options with correct flag
- **Example**:
```json
{
  "type": "TRUE_FALSE",
  "text": "The Earth is round.",
  "options": [
    { "label": "True", "text": "True", "correct": true },
    { "label": "False", "text": "False", "correct": false }
  ]
}
```

### 3. Numeric Questions
- **Format**: Questions requiring numerical answers
- **Grading**: Answer within tolerance range of correct value
- **Storage**: Correct answer with tolerance
- **Example**:
```json
{
  "type": "NUMERIC",
  "text": "What is 2 + 2?",
  "options": [
    { "correct_answer": 4, "tolerance": 0.1 }
  ]
}
```

### 4. Short Answer Questions
- **Format**: Open-ended text responses
- **Grading**: Requires manual review
- **Storage**: Sample answer for reference
- **Example**:
```json
{
  "type": "SHORT_ANSWER",
  "text": "Explain the concept of gravity.",
  "options": [
    { "sample_answer": "Gravity is a force that attracts objects toward each other." }
  ]
}
```

## Grading Process

### 1. Question-Level Grading
Each question is graded individually using the `gradeQuestion()` function:

```typescript
interface GradingResult {
  questionId: string
  points: number
  maxPoints: number
  isCorrect: boolean
  feedback?: string
}
```

### 2. Exam-Level Grading
Complete exams are graded using the `gradeExam()` function:

```typescript
interface ExamGradingResult {
  examResultId: string
  totalScore: number
  maxScore: number
  percentage: number
  questionResults: GradingResult[]
  needsManualReview: boolean
}
```

### 3. Automatic Submission Flow

1. **Student submits exam** → `POST /api/student/exams/[id]/submit`
2. **Status updated** → `IN_PROGRESS` → `SUBMITTED`
3. **Automatic grading** → `gradeExam()` function called
4. **Results stored** → Score, feedback, and status updated
5. **Final status** → `GRADED` (if no manual review needed) or `SUBMITTED` (if manual review required)

## API Endpoints

### Submit Exam
```
POST /api/student/exams/[id]/submit
```
- Automatically grades the exam upon submission
- Returns immediate results for auto-gradable questions
- Marks exam for manual review if needed

### View Results
```
GET /api/student/results/[id]
```
- Returns detailed results with correct/incorrect answers
- Includes feedback for each question
- Shows points earned vs. maximum points

## Result Display

Students can view their results with detailed feedback:

- ✅ **Correct answers**: Green indicator with points earned
- ❌ **Incorrect answers**: Red indicator with correct answer shown
- ⏳ **Manual review**: Yellow indicator for pending review
- 📝 **Feedback**: Explanatory text for each question

## Database Schema

### Questions Table
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  type TEXT NOT NULL, -- MCQ, TRUE_FALSE, NUMERIC, SHORT_ANSWER
  text TEXT NOT NULL,
  options JSON, -- Stores answer options and correct answers
  points INTEGER DEFAULT 1,
  order INTEGER DEFAULT 0
);
```

### Exam Results Table
```sql
CREATE TABLE exam_results (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, SUBMITTED, GRADED
  score REAL,
  max_score REAL,
  answers JSON, -- Student answers
  submitted_at TIMESTAMP,
  graded_at TIMESTAMP
);
```

## Configuration

### Admin/Proctor Question Creation

When creating questions, administrators and proctors must provide:

1. **Question text**
2. **Question type**
3. **Correct answer(s)**
4. **Point value**
5. **Additional options** (tolerance for numeric, keywords for short answer)

### Grading Settings

- **Numeric tolerance**: Default 0.01, configurable per question
- **Case sensitivity**: Configurable for text matching
- **Partial credit**: Currently not supported (binary correct/incorrect)

## Testing

Run the grading system test:

```bash
node test-complete-grading.js
```

This test verifies:
- Question creation with correct answers
- Individual question grading
- Complete exam grading
- Result storage and retrieval
- Feedback generation

## Security Features

- **Answer validation**: Prevents tampering with submitted answers
- **Token verification**: Ensures legitimate exam submissions
- **Audit logging**: Tracks all grading activities
- **Role-based access**: Only authorized users can view results

## Performance

- **Immediate grading**: Auto-gradable questions scored instantly
- **Batch processing**: Multiple exams can be graded simultaneously
- **Caching**: Results cached for quick retrieval
- **Scalability**: Designed to handle high volumes of submissions

## Future Enhancements

- **Partial credit scoring**: Award partial points for partially correct answers
- **AI-powered grading**: Automatic evaluation of short answer questions
- **Advanced feedback**: Detailed explanations and learning resources
- **Analytics**: Performance trends and learning insights
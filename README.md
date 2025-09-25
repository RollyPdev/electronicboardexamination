# e-BES - Electronic Board Examination System

A comprehensive electronic board examination platform built with Next.js, featuring advanced proctoring capabilities, real-time monitoring, and secure exam delivery.

## Features

### For Students
- **Exam Dashboard**: View available exams, results, and rankings
- **Secure Exam Taking**: Full-screen mode with anti-cheat measures
- **Camera Proctoring**: Real-time video recording during exams
- **Auto-Save**: Answers automatically saved as you work
- **Rankings & Statistics**: Track performance with leaderboards
- **Exam History**: View past exam results and feedback

### For Administrators
- **Exam Management**: Create, edit, and publish exams with various question types
- **Question Bank**: Manage questions with MCQ, True/False, Short Answer, and Numeric types
- **Result Grading**: Automated grading for objective questions, manual grading for subjective ones
- **Proctoring Review**: Access recorded videos and anti-cheat event logs
- **Analytics Dashboard**: View exam statistics and student performance

### Security & Proctoring
- **Copy/Paste Prevention**: Disabled clipboard operations during exams
- **Tab Switch Detection**: Monitors and logs window focus changes
- **Camera Recording**: Continuous video recording with chunked uploads
- **Event Logging**: Tracks all suspicious activities
- **Token-Based Security**: Secure exam sessions with time-limited tokens

### Technical Features
- **Real-time Timer**: Auto-submit when time expires
- **Responsive Design**: Works on all device sizes
- **Role-Based Access**: Separate interfaces for students and admins
- **Database Integration**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based permissions

## Technology Stack

- **Frontend**: Next.js 15.5.3 (App Router), React 19.1.0, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Proctoring**: WebRTC, MediaRecorder API
- **Storage**: File system storage for video chunks
- **Testing**: Vitest, Testing Library

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-bes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/e_bes

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Demo Admin Credentials
DEMO_ADMIN_EMAIL=admin@example.com
DEMO_ADMIN_PASSWORD=admin123
DEMO_ADMIN_NAME=Admin User

# Demo Student Credentials
DEMO_STUDENT_EMAIL=student@example.com
DEMO_STUDENT_PASSWORD=student123
DEMO_STUDENT_NAME=Student User
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Student Account
- **Email**: student@example.com
- **Password**: student123

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests and generate coverage report
npm run test:coverage
```

### End-to-End Tests

```bash
# Run Playwright tests
npm run test:e2e
```

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Create a new project on [Vercel](https://vercel.com)
3. Import your repository
4. Set environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Production

```env
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=your-production-url
```

## Project Structure

```
coeus-online-exams/
├── app/                 # Next.js app router pages
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── student/         # Student dashboard
│   └── ...              # Other pages
├── components/          # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── prisma/              # Prisma schema and seed
├── public/              # Static assets
├── __tests__/           # Test files
└── ...                  # Configuration files
```

## Database Schema

The application uses Prisma ORM with the following models:
- **User**: Student and admin accounts
- **Exam**: Exam definitions with questions
- **Question**: Individual questions with various types
- **ExamResult**: Student exam attempts and results
- **Recording**: Video recording metadata
- **AuditLog**: Security and proctoring events

## API Endpoints

### Authentication
- `POST /api/auth/callback/credentials` - User login

### Student APIs
- `GET /api/student/exams` - List available exams
- `GET /api/student/exams/[id]` - Get exam details
- `POST /api/student/exams/[id]/start` - Start an exam
- `PATCH /api/student/exams/[id]/answer` - Save answer
- `POST /api/student/exams/[id]/submit` - Submit exam
- `GET /api/student/results` - List exam results
- `GET /api/student/results/[id]` - Get exam result details
- `GET /api/student/rankings` - Get leaderboard
- `GET /api/student/stats` - Get student statistics

### Admin APIs
- `GET /api/admin/exams` - List exams
- `POST /api/admin/exams` - Create exam
- `GET /api/admin/exams/[id]` - Get exam
- `PUT /api/admin/exams/[id]` - Update exam
- `DELETE /api/admin/exams/[id]` - Delete exam
- `POST /api/admin/exams/[id]/questions` - Add question
- `PUT /api/admin/questions/[id]` - Update question
- `DELETE /api/admin/questions/[id]` - Delete question
- `GET /api/admin/exams/[id]/results` - Get exam results

### Upload APIs
- `POST /api/upload/chunk` - Upload video chunk
- `POST /api/upload/complete` - Complete upload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email] or open an issue on GitHub.
# e-bess

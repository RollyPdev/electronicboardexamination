const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking student user...')

  // Check User table
  const userStudent = await prisma.user.findUnique({
    where: { email: 'student@example.com' }
  })
  console.log('User table student:', userStudent)

  // Check Student table
  const studentRecord = await prisma.student.findUnique({
    where: { email: 'student@example.com' }
  })
  console.log('Student table record:', studentRecord)

  // If no password in User table, update it
  if (userStudent && !userStudent.password) {
    const hashedPassword = await bcrypt.hash('student123', 12)
    await prisma.user.update({
      where: { email: 'student@example.com' },
      data: { 
        password: hashedPassword,
        isActive: true
      }
    })
    console.log('✅ Updated student password in User table')
  }

  // Test password verification
  if (userStudent?.password) {
    const isValid = await bcrypt.compare('student123', userStudent.password)
    console.log('Password verification test:', isValid)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
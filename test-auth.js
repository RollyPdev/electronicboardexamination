const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  console.log('Testing authentication for student@example.com...')
  
  const credentials = {
    email: 'student@example.com',
    password: 'student123'
  }

  // Simulate the auth flow
  console.log('1. Looking up user...')
  
  // Check Student table first
  const student = await prisma.student.findUnique({
    where: { email: credentials.email }
  })
  
  let user = null
  
  if (student && student.password) {
    user = {
      id: student.id,
      email: student.email,
      name: `${student.firstName} ${student.lastName}`,
      password: student.password,
      role: 'STUDENT',
      school: student.school,
      isActive: true
    }
    console.log('Found in Student table')
  } else {
    // Check User table
    user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    console.log('Found in User table:', !!user)
  }

  if (!user) {
    console.log('❌ User not found')
    return
  }

  console.log('2. User details:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasPassword: !!user.password,
    isActive: user.isActive
  })

  // Check activation status
  if (user.role === 'STUDENT' && user.isActive === false) {
    console.log('❌ Account not activated')
    return
  }

  // Test password
  if (user.password) {
    console.log('3. Testing password...')
    const isValid = await bcrypt.compare(credentials.password, user.password)
    console.log('Password valid:', isValid)
    
    if (isValid) {
      console.log('✅ Authentication successful!')
      console.log('User should be able to login with:')
      console.log('Email:', credentials.email)
      console.log('Password:', credentials.password)
    } else {
      console.log('❌ Invalid password')
    }
  } else {
    console.log('❌ No password set for user')
  }
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
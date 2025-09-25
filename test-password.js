const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'rollyparedesva2@gmail.com' }
    })
    
    if (!user) {
      console.log('User not found')
      return
    }
    
    console.log('User found:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    })
    
    if (user.password) {
      const testPassword = 'Astigko2025!'
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log('Password test result:', isValid)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixRollyPassword() {
  try {
    const hashedPassword = await bcrypt.hash('Astigko2025!', 12)
    
    const admin = await prisma.user.update({
      where: { email: 'rollyparedesva2@gmail.com' },
      data: {
        password: hashedPassword
      }
    })
    
    console.log('Password updated for:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.password
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRollyPassword()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createRollyAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Astigko2025!', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Rolly Paredes',
        email: 'rollyparedesva2@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('Admin created:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: 'Astigko2025!'
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRollyAdmin()
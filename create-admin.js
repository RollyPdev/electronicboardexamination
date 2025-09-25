const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('Admin created:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: 'admin123'
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
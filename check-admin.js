const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true }
    })
    console.log('Admin users:', admins)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmins()
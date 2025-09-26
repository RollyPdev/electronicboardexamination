import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      role: 'STUDENT',
    },
  })

  const proctor = await prisma.user.upsert({
    where: { email: 'proctor@example.com' },
    update: {},
    create: {
      email: 'proctor@example.com',
      name: 'Proctor User',
      role: 'PROCTOR',
    },
  })

  console.log('Demo users created:', { admin, student, proctor })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
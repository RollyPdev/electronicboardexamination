const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Adding passwords to demo users...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const studentPassword = await bcrypt.hash('student123', 12)
  const proctorPassword = await bcrypt.hash('proctor123', 12)

  // Update admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
      isActive: true
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
      isActive: true
    }
  })

  // Update student user
  await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {
      password: studentPassword,
      isActive: true
    },
    create: {
      email: 'student@example.com',
      name: 'Student User',
      role: 'STUDENT',
      password: studentPassword,
      isActive: true
    }
  })

  // Update proctor user
  await prisma.user.upsert({
    where: { email: 'proctor@example.com' },
    update: {
      password: proctorPassword,
      isActive: true
    },
    create: {
      email: 'proctor@example.com',
      name: 'Proctor User',
      role: 'PROCTOR',
      password: proctorPassword,
      isActive: true
    }
  })

  console.log('✅ Demo users updated with passwords!')
  console.log('Login credentials:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Student: student@example.com / student123')
  console.log('Proctor: proctor@example.com / proctor123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
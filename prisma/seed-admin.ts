import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating admin users...')
  
  const adminUsers = [
    {
      name: 'System Administrator',
      email: 'admin@coeus.edu.ph',
      password: 'admin123',
      role: 'ADMIN' as const,
      school: 'Coeus Online Exams'
    },
    {
      name: 'Rolly Paredes',
      email: 'rollyparedesva2@gmail.com',
      password: 'rolly123',
      role: 'ADMIN' as const,
      school: 'Capiz State University'
    },
    {
      name: 'Exam Coordinator',
      email: 'coordinator@coeus.edu.ph',
      password: 'coord123',
      role: 'ADMIN' as const,
      school: 'Coeus Online Exams'
    }
  ]

  for (const admin of adminUsers) {
    const hashedPassword = await bcrypt.hash(admin.password, 12)
    
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        role: admin.role,
        school: admin.school
      },
      create: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        school: admin.school,
        emailVerified: new Date()
      }
    })
    
    console.log(`✓ Admin created: ${admin.email} (password: ${admin.password})`)
  }
  
  console.log('\nAdmin users created successfully!')
  console.log('\nLogin Credentials:')
  console.log('==================')
  adminUsers.forEach(admin => {
    console.log(`Email: ${admin.email}`)
    console.log(`Password: ${admin.password}`)
    console.log(`Role: ${admin.role}`)
    console.log('---')
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPhotos() {
  const students = await prisma.student.findMany({
    select: {
      firstName: true,
      lastName: true,
      profileImage: true
    },
    where: {
      profileImage: {
        not: null
      }
    }
  })

  console.log(`Found ${students.length} students with profile images:`)
  console.log('==========================================')
  
  students.forEach((student, index) => {
    console.log(`${index + 1}. ${student.firstName} ${student.lastName}`)
    console.log(`   Image: ${student.profileImage}`)
    console.log('---')
  })

  await prisma.$disconnect()
}

checkPhotos().catch(console.error)
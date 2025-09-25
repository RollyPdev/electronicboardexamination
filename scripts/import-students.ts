import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

const students = [
  {
    email: 'rollyparedesva2@gmail.com',
    name: 'Rolly Paredes O',
  },
  {
    email: 'jezreelmaecolas05@gmail.com',
    name: 'JEZREEL MAE COLAS B',
  },
  {
    email: 'claritoashleyace@gmail.com',
    name: 'Ashley Ace Clarito',
  },
  {
    email: 'reynaldobaniel1@gmail.com',
    name: 'Reynaldo Baniel',
  },
  {
    email: 'vicentekenneth2@gmail.com',
    name: 'Kenneth Vicente',
  },
  {
    email: 'rayandrebabela22@gamail.com',
    name: 'Ray Andre babila R',
  },
  {
    email: 'jamellaamnso@mail.com',
    name: 'Jamella Aminoso B',
  },
  {
    email: 'ochavezkevin@gmail.com',
    name: 'KEVIN OCHAVEZ G',
  },
  {
    email: 'sangrineskristine@gmail.com',
    name: 'KRISTINE ROSE SANGRINES B',
  },
  {
    email: 'jairelle.depedro@hercorcollege.edu.ph',
    name: 'Jairelle De Pedro S',
  },
  {
    email: 'leslievacaro24@gmail.com',
    name: 'Leslie Vacaro M',
  },
  {
    email: 'durancyrene@gmail.com',
    name: 'Cyren Duran E',
  },
  {
    email: 'libardopaulline03@gmail.com',
    name: 'Paulline Libardo B',
  },
  {
    email: 'reyesblessiemay34@gmail.com',
    name: 'BLESSIE MAY REYES I',
  },
]

async function importStudents() {
  console.log('Importing students...')
  
  for (const student of students) {
    try {
      await prisma.user.upsert({
        where: { email: student.email },
        update: {},
        create: {
          email: student.email,
          name: student.name,
          role: 'STUDENT',
        },
      })
      console.log(`✓ Imported: ${student.name}`)
    } catch (error) {
      console.error(`✗ Failed to import ${student.name}:`, error)
    }
  }
  
  console.log('Import completed!')
}

importStudents()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
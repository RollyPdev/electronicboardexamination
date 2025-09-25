import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const studentsData = [
  {
    id: 'cmeybuwk70001jwfmnzi1fb6g',
    studentId: 'STU-91BB7E',
    firstName: 'Rolly',
    lastName: 'Paredes',
    middleName: 'O',
    gender: 'Male',
    birthDate: new Date('1994-10-05T00:00:00.000Z'),
    age: 30,
    birthPlace: 'Roxas City',
    contactNumber: '09857917445',
    email: 'rollyparedesva2@gmail.com',
    address: 'Sitio Agbatang',
    region: 'Region VI (Western Visayas)',
    province: 'Capiz',
    cityMunicipality: 'City of Roxas',
    barangay: 'Balijuagan',
    zipCode: '5800',
    guardianFirstName: 'Rolly',
    guardianLastName: 'Paredes',
    guardianMiddleName: 'O',
    guardianContactNumber: '09857917445',
    guardianAddress: 'Sitio Agbatang West, Balijuagan, Roxas City',
    guardianRelationship: 'Parent',
    school: 'Capiz State University Main Campus - Roxas City',
    course: 'Bachelor of Science in Criminology',
    graduationYear: '2025',
    howDidYouKnow: 'Social Media',
    profileImage: '/learning-1.jpg',
    status: 'active',
    createdAt: new Date('2025-08-30T13:58:50.395Z'),
    updatedAt: new Date('2025-08-30T13:59:21.272Z')
  },
  {
    id: 'cmeycy7c6000rjwfmmfmldivk',
    studentId: 'STU-205F30',
    firstName: 'JEZREEL MAE',
    lastName: 'COLAS',
    middleName: 'B',
    gender: 'Female',
    birthDate: new Date('2003-01-05T00:00:00.000Z'),
    age: 22,
    birthPlace: 'MALOCLOC SUR, IVISAN, CAPIZ',
    contactNumber: '09705129454',
    email: 'jezreelmaecolas05@gmail.com',
    address: 'SITIO MAHAYAG BRGY. MALOCLOC SUR, IVISAN, CAPIZ',
    region: 'Region VI (Western Visayas)',
    province: 'Capiz',
    cityMunicipality: 'Ivisan',
    barangay: 'Malocloc Sur',
    zipCode: '5805',
    guardianFirstName: 'JELLYN',
    guardianLastName: 'COLAS',
    guardianMiddleName: 'B',
    guardianContactNumber: '0912462049',
    guardianAddress: 'MALOCLOC SUR, IVISAN, CAPIZ',
    guardianRelationship: 'Sibling',
    school: 'Capiz State University - Dayao Campus (Roxas City)',
    course: 'Bachelor of Science in Criminology',
    graduationYear: '2024-2025',
    howDidYouKnow: 'School',
    profileImage: '/image-2.jpg',
    status: 'active',
    createdAt: new Date('2025-08-30T14:29:23.939Z'),
    updatedAt: new Date('2025-08-30T15:00:27.573Z')
  },
  {
    id: 'cmf0wh51i0000l4gux1w14gs2',
    studentId: 'STU-BB97CE',
    firstName: 'Ashley Ace',
    lastName: 'Clarito',
    middleName: null,
    gender: 'Female',
    birthDate: new Date('2002-11-21T00:00:00.000Z'),
    age: 22,
    birthPlace: 'Roxas City',
    contactNumber: '09102297354',
    email: 'claritoashleyace@gmail.com',
    address: 'Brgy Mongpong',
    region: 'Region VI (Western Visayas)',
    province: 'Capiz',
    cityMunicipality: 'City of Roxas',
    barangay: 'Mongpong',
    zipCode: '5800',
    guardianFirstName: 'Arlene',
    guardianLastName: 'Adriatico',
    guardianMiddleName: null,
    guardianContactNumber: '09636638038',
    guardianAddress: 'Brgy mongpong Roxas city Capiz',
    guardianRelationship: 'Parent',
    school: 'Capiz State University Dayao Satellite College',
    course: 'Bachelor of Science in Criminology',
    graduationYear: '2025',
    howDidYouKnow: 'School',
    profileImage: '/image-3.jpg',
    status: 'active',
    createdAt: new Date('2025-09-01T09:11:32.546Z'),
    updatedAt: new Date('2025-09-01T09:52:01.414Z')
  }
]

async function main() {
  console.log('Seeding students...')
  
  for (const student of studentsData) {
    await prisma.student.upsert({
      where: { id: student.id },
      update: student,
      create: student,
    })
  }
  
  console.log('Students seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
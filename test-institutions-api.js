const { PrismaClient } = require('@prisma/client/edge')
const { withAccelerate } = require('@prisma/extension-accelerate')

async function testInstitutionsAPI() {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19VZjBLQlFOdW9yYzMzeEx3Y1dQY1AiLCJhcGlfa2V5IjoiMDFLNUFHOTRWWEFXMTIxRVZUQ00yVzBEQzkiLCJ0ZW5hbnRfaWQiOiI5ZjRkZDViODAxNzIyOWYyNWUxMjdjZWU3MjM2N2Y0MDY1ZTEwNGFhZjA2NjBkMGJlYmRjZmZmZjYxNGIxNGYwIiwiaW50ZXJuYWxfc2VjcmV0IjoiNjgxM2U0ZjUtYmM3ZS00NDUzLThhNjMtODIwZTZmOWJkZmE4In0.pBxk4W3e3I21BAGgYp5Zk4-HGxBT4vysWpE-KH5Wbu4"
        }
      }
    }).$extends(withAccelerate())

    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✓ Database connected')

    // Check if institutions table exists and has data
    const count = await prisma.institution.count()
    console.log(`✓ Institutions table exists with ${count} records`)

    if (count > 0) {
      const sample = await prisma.institution.findFirst()
      console.log('✓ Sample institution:', sample?.name)
    }

    await prisma.$disconnect()
    console.log('✓ Test completed successfully')

  } catch (error) {
    console.error('✗ Error:', error.message)
    if (error.code) console.error('Error code:', error.code)
  }
}

testInstitutionsAPI()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Adding Law Buddy model to database...')

  try {
    // The schema changes will be applied when you run prisma db push
    console.log('Schema updated successfully!')
    console.log(
      'Run "npx prisma db push" to apply the changes to your database.'
    )
  } catch (error) {
    console.error('Error updating schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

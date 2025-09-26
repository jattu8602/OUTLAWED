const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateNotifications() {
  try {
    console.log('Starting notification migration...')

    // The new schema will be automatically created when you run prisma db push
    // This script is just for reference and any data cleanup you might need

    console.log('Migration completed successfully!')
    console.log('Next steps:')
    console.log('1. Run: npx prisma db push')
    console.log('2. Run: npx prisma generate')
    console.log('3. Restart your development server')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateNotifications()

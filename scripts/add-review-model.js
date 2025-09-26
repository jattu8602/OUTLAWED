const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addReviewModel() {
  try {
    console.log('Adding Review model to database...')

    // The Review model will be created automatically by MongoDB when the first document is inserted
    // We just need to ensure the Prisma client is updated

    console.log('Review model setup complete!')
    console.log(
      'The Review collection will be created when the first review is submitted.'
    )
  } catch (error) {
    console.error('Error setting up Review model:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addReviewModel()

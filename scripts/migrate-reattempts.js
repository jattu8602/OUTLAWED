const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateReattempts() {
  try {
    console.log('Starting reattempt migration...')

    // Get all test attempts
    const allAttempts = await prisma.testAttempt.findMany({
      orderBy: [{ userId: 'asc' }, { testId: 'asc' }, { startedAt: 'asc' }],
    })

    console.log(`Found ${allAttempts.length} test attempts to migrate`)

    // Group attempts by user and test
    const attemptsByUserAndTest = {}

    allAttempts.forEach((attempt) => {
      const key = `${attempt.userId}-${attempt.testId}`
      if (!attemptsByUserAndTest[key]) {
        attemptsByUserAndTest[key] = []
      }
      attemptsByUserAndTest[key].push(attempt)
    })

    let updatedCount = 0

    // Update each group of attempts
    for (const [key, attempts] of Object.entries(attemptsByUserAndTest)) {
      if (attempts.length === 1) {
        // Single attempt - mark as latest
        await prisma.testAttempt.update({
          where: { id: attempts[0].id },
          data: {
            attemptNumber: 1,
            isLatest: true,
            previousAttemptId: null,
          },
        })
        updatedCount++
      } else {
        // Multiple attempts - number them and link them
        for (let i = 0; i < attempts.length; i++) {
          const attempt = attempts[i]
          const attemptNumber = i + 1
          const isLatest = i === 0 // First one (most recent) is latest
          const previousAttemptId = i > 0 ? attempts[i - 1].id : null

          await prisma.testAttempt.update({
            where: { id: attempt.id },
            data: {
              attemptNumber,
              isLatest,
              previousAttemptId,
            },
          })
          updatedCount++
        }
      }
    }

    console.log(`Successfully migrated ${updatedCount} test attempts`)
    console.log('Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateReattempts()
}

module.exports = { migrateReattempts }

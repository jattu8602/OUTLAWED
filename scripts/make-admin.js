const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' },
    })

    console.log(`✅ Successfully converted ${email} to ADMIN role`)
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`❌ User with email ${email} not found`)
    } else {
      console.error('❌ Error updating user:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/make-admin.js <email>')
  console.log('Example: node scripts/make-admin.js user@example.com')
  process.exit(1)
}

makeAdmin(email)

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This route is for fetching all tests, mainly for admin purposes like adding to a series.
// It's a simplified version compared to the one that might exist for users (e.g., with pagination, filtering).
export async function GET() {
  const session = await getServerSession(authOptions)
  // Secure this endpoint to be admin-only
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tests = await prisma.test.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching all tests:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

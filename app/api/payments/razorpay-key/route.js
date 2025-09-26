import { NextResponse } from 'next/server'

// GET - Expose Razorpay key to client
export async function GET() {
  try {
    const key =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID

    if (!key) {
      return NextResponse.json(
        { error: 'Razorpay key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({ key })
  } catch (error) {
    console.error('Error fetching Razorpay key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

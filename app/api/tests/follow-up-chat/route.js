import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, analysis, userMessage } = await request.json()

    if (!questionId || !analysis || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const prompt = `
        You are an expert legal studies tutor, continuing a conversation with a student about a specific test question.

        **Original Question:**
        ${question.questionText.replace(/<[^>]*>/g, '')}

        **Your Previous Detailed Analysis:**
        ${analysis.replace(/<[^>]*>/g, '')}

        **Student's Follow-up Question:**
        ${userMessage}

        **Instructions:**
        Answer the student's follow-up question concisely and accurately. Stay on topic and refer back to the original question and your previous analysis if necessary.
      `

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant specialized in helping law students with CLAT preparation. You are answering a follow-up question about a test analysis.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.6,
        }),
      }
    )

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get follow-up answer' },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    const followUpAnswer = openaiData.choices[0]?.message?.content || ''

    return NextResponse.json({ followUpAnswer })
  } catch (error) {
    console.error('Follow-up chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process follow-up message' },
      { status: 500 }
    )
  }
}

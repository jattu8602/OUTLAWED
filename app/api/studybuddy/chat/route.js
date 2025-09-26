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

    const { message, chatId, referenceTestId } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    let testContext = ''
    if (referenceTestId) {
      const testAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId: session.user.id,
          testId: referenceTestId,
          isLatest: true,
        },
        include: {
          test: {
            include: {
              questions: true,
            },
          },
          answers: true,
        },
      })

      if (testAttempt) {
        testContext = `
Reference Test Context:
- Test: ${testAttempt.test.title}
- Score: ${testAttempt.score || 'N/A'}%
- Correct Answers: ${testAttempt.correctAnswers || 0}
- Wrong Answers: ${testAttempt.wrongAnswers || 0}
- Unattempted: ${testAttempt.unattempted || 0}
- Time Taken: ${
          testAttempt.totalTimeSec
            ? Math.round(testAttempt.totalTimeSec / 60)
            : 'N/A'
        } minutes

Recent Questions and Answers:
${testAttempt.test.questions
  .slice(0, 5)
  .map((q) => {
    const studentAnswer = testAttempt.answers.find((a) => a.questionId === q.id)
    return `
Q${q.questionNumber}: ${q.questionText}
Correct Answer: ${q.correctAnswers.join(', ')}
Student's Answer: ${
      studentAnswer?.selectedOption?.join(', ') || 'Not attempted'
    }
`
  })
  .join('\n')}
        `
      }
    }

    const systemPrompt = `You are Study Buddy, an AI assistant specialized in helping students with CLAT preparation and legal studies.

${
  testContext
    ? `The student is asking about a specific test they've taken. Use this context to provide personalized help: ${testContext}`
    : ''
}

Guidelines:
1. Provide clear, accurate explanations of legal concepts
2. Help with test-taking strategies and study tips
3. Explain complex legal reasoning in simple terms
4. Suggest relevant case laws and examples when appropriate
5. Be encouraging and supportive
6. If the student is asking about a specific test, reference their performance and provide targeted advice
7. Keep responses concise but comprehensive
8. Use legal terminology appropriately but explain complex terms

Remember: You're helping a law student prepare for CLAT and understand legal concepts. Be patient, thorough, and encouraging.`

     const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Temporarily switch to gpt-4o-mini for testing
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 1000, // Use max_tokens instead of max_completion_tokens for gpt-4o-mini
          temperature: 0.7,
        }),
      }
    )
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      console.error('OpenAI API Error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
      })
      throw new Error(
        `OpenAI API error: ${openaiResponse.status} - ${
          errorData.error?.message || openaiResponse.statusText
        }`
      )
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content || ''

    if (!aiResponse || aiResponse.trim() === '') {
      console.error('Empty AI response received')
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 }
      )
    }

    let currentChatId = chatId

    if (!currentChatId) {
      const newChat = await prisma.studyBuddyChat.create({
        data: {
          userId: session.user.id,
          title: generateChatTitle(message),
          referenceTestId: referenceTestId,
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() },
          ],
        },
      })
      currentChatId = newChat.id
    } else {
      const existingChat = await prisma.studyBuddyChat.findUnique({
        where: { id: currentChatId },
      })

      if (existingChat) {
        const updatedMessages = [
          ...existingChat.messages,
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() },
        ]

        await prisma.studyBuddyChat.update({
          where: { id: currentChatId },
          data: {
            messages: updatedMessages,
            updatedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      response: aiResponse,
      chatId: currentChatId,
    })
  } catch (error) {
    console.error('Study Buddy chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

function generateChatTitle(message) {
  const words = message.toLowerCase().split(' ')

  if (words.includes('contract') || words.includes('agreement')) {
    return 'Contract Law Discussion'
  } else if (words.includes('tort') || words.includes('negligence')) {
    return 'Tort Law Questions'
  } else if (
    words.includes('constitutional') ||
    words.includes('fundamental')
  ) {
    return 'Constitutional Law Help'
  } else if (words.includes('criminal') || words.includes('penal')) {
    return 'Criminal Law Assistance'
  } else if (words.includes('test') || words.includes('exam')) {
    return 'Test Preparation Help'
  } else if (words.includes('study') || words.includes('preparation')) {
    return 'Study Strategy Discussion'
  } else {
    return 'Study Buddy Chat'
  }
}
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Get user's test attempt data if reference test is provided
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

    // Check for roadmap creation request
    const isRoadmapRequest =
      message.toLowerCase().includes('#plan') ||
      message.toLowerCase().includes('plan a learning path') ||
      message.toLowerCase().includes('create a roadmap')

    // Get user's active roadmaps for context
    let roadmapContext = ''
    if (chatId) {
      const activeRoadmaps = await prisma.learningRoadmap.findMany({
        where: {
          userId: session.user.id,
          isActive: true,
          chatId: chatId,
        },
        include: {
          roadmapProcesses: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      if (activeRoadmaps.length > 0) {
        roadmapContext = `
Active Learning Roadmaps:
${activeRoadmaps
  .map(
    (roadmap) => `
- ${roadmap.title} (${roadmap.topic})
  Processes: ${roadmap.roadmapProcesses
    .map((p) => `${p.order}. ${p.title} ${p.isCompleted ? '✓' : '○'}`)
    .join(', ')}
`
  )
  .join('\n')}
        `
      }
    }

    // Prepare the system prompt for Law Buddy
    const systemPrompt = `You are Law Buddy, an AI assistant specialized in helping law students with CLAT preparation and legal studies.

${
  testContext
    ? `The student is asking about a specific test they've taken. Use this context to provide personalized help: ${testContext}`
    : ''
}

${roadmapContext ? `Current Learning Roadmaps: ${roadmapContext}` : ''}

Guidelines:
1. Provide clear, accurate explanations of legal concepts
2. Help with test-taking strategies and study tips
3. Explain complex legal reasoning in simple terms
4. Suggest relevant case laws and examples when appropriate
5. Be encouraging and supportive
6. If the student is asking about a specific test, reference their performance and provide targeted advice
7. Keep responses concise but comprehensive
8. Use legal terminology appropriately but explain complex terms
9. If the user requests a learning roadmap (uses #plan tag or asks for "plan a learning path"), create a structured roadmap with 5-6 sequential processes
10. When creating roadmaps, format them as: "ROADMAP: [Title] - [Topic]" followed by numbered processes
11. Monitor chat for process completion and mark processes as done when the user demonstrates understanding

Remember: You're helping a law student prepare for CLAT and understand legal concepts. Be patient, thorough, and encouraging.`

    // Call OpenAI API
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
    console.log('OpenAI Response:', openaiData) // Debug log

    if (
      !openaiData.choices ||
      !openaiData.choices[0] ||
      !openaiData.choices[0].message
    ) {
      console.error('Invalid OpenAI response:', openaiData)
      throw new Error('Invalid response from OpenAI API')
    }

    const messageObj = openaiData.choices[0].message
    console.log('Message object:', messageObj) // Debug the full message object
    console.log('Message keys:', Object.keys(messageObj)) // Debug message keys

    // Try different possible content fields
    const aiResponse =
      messageObj.content || messageObj.text || messageObj.message || ''
    console.log('AI Response content:', aiResponse) // Debug log
    console.log('AI Response length:', aiResponse?.length) // Debug log

    // Also check if there's a reasoning field
    if (openaiData.choices[0].reasoning) {
      console.log('Reasoning content:', openaiData.choices[0].reasoning)
    }

    // Check the full choice object
    console.log('Full choice object:', openaiData.choices[0])

    // Check if there's a different response structure
    if (openaiData.choices[0].delta && openaiData.choices[0].delta.content) {
      console.log('Delta content:', openaiData.choices[0].delta.content)
    }

    // Fallback if response is empty
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('Empty AI response received')
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 }
      )
    }

    // Check if AI response contains a roadmap
    const roadmapMatch = aiResponse.match(
      /ROADMAP:\s*(.+?)\s*-\s*(.+?)(?:\n|$)/
    )
    let createdRoadmap = null

    console.log('Roadmap detection:', {
      isRoadmapRequest,
      roadmapMatch,
      aiResponse: aiResponse.substring(0, 200) + '...',
    })

    // Check for process completion indicators
    const completionIndicators = [
      'completed',
      'finished',
      'done',
      'understood',
      'got it',
      'clear',
      'makes sense',
      'i see',
      'i understand',
    ]

    const hasCompletionIndicator = completionIndicators.some(
      (indicator) =>
        aiResponse.toLowerCase().includes(indicator) ||
        message.toLowerCase().includes(indicator)
    )

    let completedProcess = null
    if (hasCompletionIndicator && chatId) {
      // Find the next incomplete process in active roadmaps
      const activeRoadmaps = await prisma.learningRoadmap.findMany({
        where: {
          userId: session.user.id,
          isActive: true,
          chatId: chatId,
        },
        include: {
          roadmapProcesses: {
            where: {
              isCompleted: false,
            },
            orderBy: {
              order: 'asc',
            },
            take: 1,
          },
        },
      })

      if (
        activeRoadmaps.length > 0 &&
        activeRoadmaps[0].roadmapProcesses.length > 0
      ) {
        const nextProcess = activeRoadmaps[0].roadmapProcesses[0]

        // Mark the process as completed
        await prisma.roadmapProcess.update({
          where: {
            id: nextProcess.id,
          },
          data: {
            isCompleted: true,
            completedAt: new Date(),
          },
        })

        completedProcess = nextProcess
        console.log('Marked process as completed:', nextProcess.id)

        // Check if all processes are completed
        const allProcesses = await prisma.roadmapProcess.findMany({
          where: {
            roadmapId: activeRoadmaps[0].id,
          },
        })

        const allCompleted = allProcesses.every(
          (process) => process.isCompleted
        )

        if (allCompleted) {
          // Deactivate the roadmap
          await prisma.learningRoadmap.update({
            where: {
              id: activeRoadmaps[0].id,
            },
            data: {
              isActive: false,
            },
          })
          console.log(
            'Roadmap completed and deactivated:',
            activeRoadmaps[0].id
          )
        }
      }
    }

    // Save or update chat in database
    let currentChatId = chatId
    console.log('Chat API - Current chatId:', currentChatId)

    if (!currentChatId) {
      // Create new chat
      console.log('Chat API - Creating new chat for user:', session.user.id)
      const newChat = await prisma.lawBuddyChat.create({
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
      console.log('Chat API - Created new chat with ID:', currentChatId)
    } else {
      // Update existing chat
      console.log('Chat API - Updating existing chat:', currentChatId)
      const existingChat = await prisma.lawBuddyChat.findUnique({
        where: { id: currentChatId },
      })

      if (existingChat) {
        const updatedMessages = [
          ...existingChat.messages,
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() },
        ]

        await prisma.lawBuddyChat.update({
          where: { id: currentChatId },
          data: {
            messages: updatedMessages,
            updatedAt: new Date(),
          },
        })
        console.log('Chat API - Updated existing chat')
      }
    }

    // Create roadmap if detected in AI response
    if (roadmapMatch && isRoadmapRequest) {
      const roadmapTitle = roadmapMatch[1].trim()
      const roadmapTopic = roadmapMatch[2].trim()

      console.log('Creating roadmap:', { roadmapTitle, roadmapTopic })

      // Extract processes from the response
      const processMatches = aiResponse.match(/(\d+)\.\s*(.+?)(?:\n|$)/g)
      const processes = processMatches
        ? processMatches.map((match) => {
            const [, order, title] = match.match(/(\d+)\.\s*(.+)/)
            return {
              title: title.trim(),
              description: '',
              order: parseInt(order),
            }
          })
        : []

      console.log('Extracted processes:', processes)

      if (processes.length > 0) {
        try {
          const roadmap = await prisma.learningRoadmap.create({
            data: {
              userId: session.user.id,
              title: roadmapTitle,
              topic: roadmapTopic,
              processes: processes,
              chatId: currentChatId,
            },
          })

          // Create individual process records
          await Promise.all(
            processes.map((process, index) =>
              prisma.roadmapProcess.create({
                data: {
                  roadmapId: roadmap.id,
                  title: process.title,
                  description: process.description,
                  order: index + 1,
                },
              })
            )
          )

          createdRoadmap = roadmap
          console.log('Created roadmap successfully:', roadmap.id)
        } catch (error) {
          console.error('Error creating roadmap:', error)
        }
      }
    }

    return NextResponse.json({
      response: aiResponse,
      chatId: currentChatId,
      roadmap: createdRoadmap
        ? {
            id: createdRoadmap.id,
            title: createdRoadmap.title,
            topic: createdRoadmap.topic,
            processes: createdRoadmap.processes,
          }
        : null,
      completedProcess: completedProcess
        ? {
            id: completedProcess.id,
            title: completedProcess.title,
            order: completedProcess.order,
          }
        : null,
    })
  } catch (error) {
    console.error('Law Buddy chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

function generateChatTitle(message) {
  // Generate a meaningful title based on the first message
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
    return 'Law Buddy Chat'
  }
}

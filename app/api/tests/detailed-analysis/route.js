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

    const { testId, attemptId, questionId } = await request.json()

    if (!testId || !attemptId || !questionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch question, test, and attempt data in parallel
    const [question, testAttempt] = await Promise.all([
      prisma.question.findUnique({
        where: { id: questionId },
      }),
      prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: {
            where: { questionId: questionId },
          },
        },
      }),
    ])

    if (!question || !testAttempt) {
      return NextResponse.json(
        { error: 'Question or test attempt not found' },
        { status: 404 }
      )
    }

    const userAnswer = testAttempt.answers[0]
    const userStatus = userAnswer
      ? userAnswer.isCorrect
        ? 'correct'
        : 'incorrect'
      : 'unattempted'

    // Construct a detailed prompt for OpenAI
    const prompt = `
      You are an expert legal studies tutor, providing a detailed analysis of a student's answer on a CLAT practice test.

      **Context:**
      - **Question Number:** ${question.questionNumber}
      - **Section:** ${question.section.replace('_', ' ')}
      - **Student's Status:** The student answered this question **${userStatus}**.

      **Question:**
      ${question.questionText.replace(/<[^>]*>/g, '')}

      **Options:**
      ${
        question.options
          ? question.options
              .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
              .join('\n')
          : 'This is not a multiple-choice question.'
      }

      **Correct Answer(s):**
      ${question.correctAnswers.join(', ')}

      **Student's Answer:**
      ${userAnswer?.selectedOption?.join(', ') || 'Not Answered'}

      **Instructions:**
      Provide a comprehensive, clear, and well-structured analysis in rich text (HTML). Your analysis should include the following sections:
      1.  **Correct Answer Explanation:** A detailed breakdown of why the correct answer is correct. Explain the underlying legal principles, reasoning, or calculations involved.
      2.  **Incorrect Options Analysis:** If there are options, explain why each of the other options is incorrect.
      3.  **Personalized Feedback for the Student:** Based on their answer (${userStatus}), give them targeted feedback.
          - If they were correct, praise their reasoning and reinforce the concept.
          - If they were incorrect, gently explain their mistake and clarify the concept.
          - If they didn't attempt, explain the importance of the question and encourage them to try similar questions.
      4.  **Key Takeaway:** A concluding sentence or two summarizing the main learning point from this question.

      Format your response using HTML tags like <h3> for headings, <p> for paragraphs, <ul> and <li> for lists, and <strong> for important terms.
    `

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 500 }
      )
    }

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
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant specialized in helping law students with CLAT preparation. Generate detailed, rich-text explanations for test questions.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        }),
      }
    )

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate AI analysis' },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    const analysis = openaiData.choices[0]?.message?.content || ''

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI returned an empty analysis' },
        { status: 500 }
      )
    }

    // Here you could cache the result in your database if you want to persist it
    // For now, we just return it.

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Detailed analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate detailed analysis' },
      { status: 500 }
    )
  }
}

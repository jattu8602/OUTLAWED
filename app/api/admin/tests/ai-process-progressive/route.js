import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const AI_PROMPT = `# Role
You are an expert AI for automated **test paper structuring and generation**.
Your job: take raw pasted exam content (from PDF/Word) and produce a **clean, branded test** in JSON format.

---

# Input
- I will paste a large block of text (test data from PDF/Word).
- The text may contain **broken formatting, noise, and raw details**.

---

# Rules
1. **Extract only useful test information**:
   - Passages
   - Questions
   - Options
   - Correct option
   - Explanation (if missing, generate a logical explanation yourself)
   - If correct answer is missing, infer the most probable correct answer.

2. **Organize subject-wise in this exact order**:
   - ENGLISH
   - GK_CA
   - LEGAL_REASONING
   - LOGICAL_REASONING
   - QUANTITATIVE_TECHNIQUES

If a subject does not exist in the input → skip it.

Question numbering must always be increasing across the entire test.
Example: Q1, Q2, Q3… (do not reset numbers after a new passage).

Passage-Question Linking

If a passage is followed by multiple questions → keep the same passage for all those questions.

When a new passage starts → link that to the next group of questions.

Broken / noisy text must be fixed, cleaned, and made readable.

Final output must be branded as a clean JSON test structure:
{
  "testTitle": "Generated Test",
  "sections": [
    {
      "sectionType": "ENGLISH",
      "questions": [
        {
          "number": 1,
          "passage": "Passage text here...",
          "question": "Question text here...",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correctOption": "B",
          "explanation": "Explanation here..."
        }
      ]
    }
  ]
}

# Output
Always return valid JSON in the above schema.

Fill in missing explanations or correct answers when they are not in the input.

Ensure branding: clean, professional, exam-ready.

# Special Notes
If input is huge, process sequentially by section.

Do not hallucinate random extra questions beyond given text.

Always keep JSON clean and machine-readable.`

// Store processing state in memory (in production, use Redis or database)
const processingStates = new Map()

// Robust JSON parsing function to handle malformed AI responses
function parseAIResponse(response) {
  try {
    // Clean the response
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Try to find the JSON object boundaries
    const jsonStart = cleanedResponse.indexOf('{')
    const jsonEnd = cleanedResponse.lastIndexOf('}')

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
    }

    // More aggressive cleaning for control characters
    cleanedResponse = cleanedResponse
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']') // Remove trailing commas before ]
      // Remove or replace problematic characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\\n/g, '\n') // Convert back to actual newlines for readability
      // Clean up any double spaces
      .replace(/\s{2,}/g, ' ')

    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.error('JSON parsing error:', error)
    console.error('Raw response length:', response.length)
    console.error('Raw response preview:', response.substring(0, 500))

    // Fallback: try to extract basic structure
    try {
      const fallbackResponse = {
        testTitle: 'Generated Test',
        sections: [],
      }

      // Try to extract sections from the response
      const sectionMatches = response.match(
        /(ENGLISH|GK_CA|LEGAL_REASONING|LOGICAL_REASONING|QUANTITATIVE_TECHNIQUES)/gi
      )
      if (sectionMatches) {
        fallbackResponse.sections = sectionMatches.map((section) => ({
          sectionType: section.toUpperCase(),
          estimatedQuestions: 5, // Default estimate
        }))
      } else {
        // Default to English section
        fallbackResponse.sections = [
          {
            sectionType: 'ENGLISH',
            estimatedQuestions: 10,
          },
        ]
      }

      return fallbackResponse
    } catch (fallbackError) {
      console.error('Fallback parsing also failed:', fallbackError)
      throw new Error('Unable to parse AI response')
    }
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { rawText, testTitle, testId, action, processingId } =
      await request.json()

    if (action === 'start') {
      // Start new processing
      if (!rawText || !rawText.trim()) {
        return NextResponse.json(
          { error: 'Raw text is required' },
          { status: 400 }
        )
      }

      const processingId = `processing_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      // Initialize processing state
      processingStates.set(processingId, {
        rawText,
        testTitle: testTitle || 'AI Generated Test',
        testId,
        currentSection: 0,
        currentQuestion: 0,
        totalSections: 0,
        totalQuestions: 0,
        processedQuestions: 0,
        sections: [],
        status: 'initializing',
        startTime: Date.now(),
      })

      // Start processing in background
      processQuestionsInBackground(processingId)

      return NextResponse.json({
        processingId,
        status: 'started',
        message: 'Processing started successfully',
      })
    }

    if (action === 'status') {
      // Get processing status
      if (!processingId) {
        return NextResponse.json(
          { error: 'Processing ID is required' },
          { status: 400 }
        )
      }

      const state = processingStates.get(processingId)
      if (!state) {
        return NextResponse.json(
          { error: 'Processing not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        processingId,
        status: state.status,
        progress: {
          currentSection: state.currentSection,
          currentQuestion: state.currentQuestion,
          totalSections: state.totalSections,
          totalQuestions: state.totalQuestions,
          processedQuestions: state.processedQuestions,
          percentage:
            state.totalQuestions > 0
              ? Math.round(
                  (state.processedQuestions / state.totalQuestions) * 100
                )
              : 0,
        },
        sections: state.sections,
        testTitle: state.testTitle,
        error: state.error,
      })
    }

    if (action === 'cancel') {
      // Cancel processing
      if (!processingId) {
        return NextResponse.json(
          { error: 'Processing ID is required' },
          { status: 400 }
        )
      }

      const state = processingStates.get(processingId)
      if (state) {
        state.status = 'cancelled'
        processingStates.delete(processingId)
      }

      return NextResponse.json({
        message: 'Processing cancelled successfully',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in progressive AI processing:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function processQuestionsInBackground(processingId) {
  const state = processingStates.get(processingId)
  if (!state) return

  try {
    state.status = 'processing'

    // First, get the overall structure
    const structurePrompt = `${AI_PROMPT}\n\n# Input:\n${state.rawText}\n\n# Task: Analyze the text and return ONLY the structure with section types and estimated question counts. Return VALID JSON in this EXACT format (no extra text, no markdown):\n{\n  "testTitle": "Title",\n  "sections": [\n    {"sectionType": "ENGLISH", "estimatedQuestions": 5},\n    {"sectionType": "GK_CA", "estimatedQuestions": 3}\n  ]\n}\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown formatting, no extra text.`

    const structureResponse = await callGeminiAPI(structurePrompt)
    const structure = parseAIResponse(structureResponse)

    state.testTitle = structure.testTitle
    state.totalSections = structure.sections.length
    state.totalQuestions = structure.sections.reduce(
      (total, section) => total + section.estimatedQuestions,
      0
    )
    state.sections = structure.sections.map((section) => ({
      sectionType: section.sectionType,
      questions: [],
      estimatedQuestions: section.estimatedQuestions,
    }))

    // Process each section
    for (
      let sectionIndex = 0;
      sectionIndex < state.sections.length;
      sectionIndex++
    ) {
      state.currentSection = sectionIndex
      const section = state.sections[sectionIndex]

      // Process questions for this section
      const sectionPrompt = `${AI_PROMPT}\n\n# Input:\n${state.rawText}\n\n# Task: Extract ONLY ${section.sectionType} questions from the text. Return VALID JSON in this EXACT format (no extra text, no markdown):\n{\n  "sections": [\n    {\n      "sectionType": "${section.sectionType}",\n      "questions": [\n        {\n          "number": 1,\n          "passage": "Passage text here...",\n          "question": "Question text here...",\n          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],\n          "correctOption": "B",\n          "explanation": "Explanation here..."\n        }\n      ]\n    }\n  ]\n}\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown formatting, no extra text.`

      const sectionResponse = await callGeminiAPI(sectionPrompt)
      const sectionData = parseAIResponse(sectionResponse)

      if (sectionData.sections && sectionData.sections.length > 0) {
        const foundSection = sectionData.sections.find(
          (s) => s.sectionType === section.sectionType
        )
        if (foundSection && foundSection.questions) {
          section.questions = foundSection.questions.map((question, index) => ({
            number: question.number || state.processedQuestions + index + 1,
            passage: question.passage || '',
            question: question.question?.trim() || '',
            options: question.options?.map((opt) => opt.trim()) || [],
            correctOption: question.correctOption || 'A',
            explanation: question.explanation || 'Explanation not provided',
          }))

          state.processedQuestions += section.questions.length
        }
      }

      // Save progress to database after each section
      if (state.testId) {
        await saveQuestionsToDatabase(
          state.testId,
          section.questions,
          section.sectionType
        )
      }
    }

    state.status = 'completed'

    // Clean up after 5 minutes
    setTimeout(() => {
      processingStates.delete(processingId)
    }, 5 * 60 * 1000)
  } catch (error) {
    console.error('Error in background processing:', error)
    state.status = 'error'
    state.error = error.message
  }
}

async function callGeminiAPI(prompt) {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  return aiResponse
}

async function saveQuestionsToDatabase(testId, questions, sectionType) {
  try {
    // Get existing question count for proper numbering
    const existingCount = await prisma.question.count({
      where: { testId },
    })

    const questionsToCreate = questions.map((questionData, index) => {
      const questionNumber = existingCount + index + 1

      // Determine question type and option type
      const questionType = 'OPTIONS'
      const optionType = questionData.options.length > 1 ? 'SINGLE' : 'SINGLE'

      // Process correct answers
      const correctAnswers = []
      if (questionData.correctOption) {
        const correctIndex =
          questionData.correctOption.toUpperCase().charCodeAt(0) - 65
        if (correctIndex >= 0 && correctIndex < questionData.options.length) {
          correctAnswers.push(questionData.options[correctIndex])
        }
      }

      return {
        testId,
        questionNumber,
        questionText: questionData.question,
        imageUrls: [],
        isComprehension: !!questionData.passage,
        comprehension: questionData.passage || null,
        isTable: false,
        tableData: null,
        questionType,
        optionType,
        options: questionData.options,
        inputAnswer: null,
        correctAnswers,
        positiveMarks: 1.0,
        negativeMarks: -0.25,
        section: sectionType,
        explanation: questionData.explanation,
      }
    })

    if (questionsToCreate.length > 0) {
      await prisma.question.createMany({
        data: questionsToCreate,
      })

      // Update test's updatedAt timestamp
      await prisma.test.update({
        where: { id: testId },
        data: { updatedAt: new Date() },
      })
    }
  } catch (error) {
    console.error('Error saving questions to database:', error)
    throw error
  }
}

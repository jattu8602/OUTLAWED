import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const AI_PROMPT = `# Role
You are an expert AI for automated **test paper structuring and generation**.
Your job: take raw pasted exam content (from PDF/Word) and produce a **clean, branded test** in JSON format.

# Input
- I will paste a large block of text (test data from PDF/Word).
- The text may contain **broken formatting, noise, and raw details**.

# Rules
1. **Extract only useful test information**:
   - Passages
   - Questions
   - Options
   - Correct option (if missing, analyze the question and passage to determine the most logical answer)
   - Explanation (if missing, generate a detailed logical explanation based on the passage content)

2. **Organize subject-wise in this exact order**:
   \`\`\`ts
   enum SectionType {
     ENGLISH
     GK_CA
     LEGAL_REASONING
     LOGICAL_REASONING
     QUANTITATIVE_TECHNIQUES
   }
   \`\`\`
   If a subject does not exist in the input → skip it.
   Question numbering must always be increasing across the entire test.
   Example: Q1, Q2, Q3… (do not reset numbers after a new passage).

3. **Passage-Question Linking**:
   If a passage is followed by multiple questions → keep the same passage for all those questions.
   When a new passage starts → link that to the next group of questions.

4. **Text Processing**:
   Broken / noisy text must be fixed, cleaned, and made readable.

5. **Answer Generation**:
   - If correct answer is not provided, analyze the question and passage to determine the most logical answer
   - Generate detailed explanations that reference specific parts of the passage
   - Ensure explanations are educational and help students understand the reasoning

6. **Final output must be branded as a clean JSON test structure**:
   \`\`\`json
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
             "explanation": "Detailed explanation referencing the passage..."
           }
         ]
       }
     ]
   }
   \`\`\`

# Output
Always return valid JSON in the above schema.
Fill in missing explanations or correct answers when they are not in the input.
Ensure branding: clean, professional, exam-ready.

# Special Notes
- If input is huge, process sequentially by section.
- Do not hallucinate random extra questions beyond given text.
- Always keep JSON clean and machine-readable.
- For missing answers, analyze the question context and passage to determine the most logical choice.
- Generate comprehensive explanations that help students learn.`

// Store manual processing state in memory
const manualProcessingStates = new Map()

// Robust JSON parsing function
function parseAIResponse(response) {
  try {
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonStart = cleanedResponse.indexOf('{')
    const jsonEnd = cleanedResponse.lastIndexOf('}')

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
    }

    // More aggressive cleaning for control characters
    cleanedResponse = cleanedResponse
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\t/g, ' ')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\\n/g, '\n')
      .replace(/\s{2,}/g, ' ')

    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.error('JSON parsing error:', error)
    throw new Error('Unable to parse AI response')
  }
}

async function callGeminiAPI(prompt) {
  try {
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
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

async function savePassageAndQuestionsToDatabase(
  testId,
  passageData,
  questions,
  sectionType
) {
  try {
    if (!questions || questions.length === 0) return

    // First, create the passage
    const passage = await prisma.passage.create({
      data: {
        testId: testId,
        passageNumber: passageData.index + 1,
        content: passageData.content,
        section: sectionType,
      },
    })

    // Then create questions that reference this passage
    const questionsToCreate = questions.map((question) => ({
      testId: testId,
      passageId: passage.id,
      questionNumber: question.number,
      questionText: question.question?.trim() || '',
      questionType: 'OPTIONS',
      optionType: 'SINGLE',
      options: question.options?.map((opt) => opt.trim()) || [],
      correctAnswers: [question.correctOption || 'A'],
      section: sectionType,
      explanation: question.explanation || 'Explanation not provided',
      positiveMarks: 1.0,
      negativeMarks: -0.25,
    }))

    await prisma.question.createMany({
      data: questionsToCreate,
    })

    await prisma.test.update({
      where: { id: testId },
      data: { updatedAt: new Date() },
    })

    return passage
  } catch (error) {
    console.error('Error saving passage and questions to database:', error)
    throw error
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      console.log('Manual AI - Unauthorized access attempt:', {
        hasSession: !!session,
        userRole: session?.user?.role,
        isAdmin: session?.user?.isAdmin,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, processingId, rawText, testId, currentPassageIndex } = body

    if (action === 'start') {
      // Initialize manual processing
      const newProcessingId = `manual_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      // First, get the overall structure to understand passages
      const structurePrompt = `${AI_PROMPT}\n\n# Input:\n${rawText}\n\n# Task: Analyze the text and identify all passages. Return ONLY the structure with passage information. Return VALID JSON in this EXACT format (no extra text, no markdown):\n{\n  "testTitle": "Title",\n  "passages": [\n    {"index": 0, "title": "Passage 1", "sectionType": "ENGLISH", "startText": "First few words..."},\n    {"index": 1, "title": "Passage 2", "sectionType": "ENGLISH", "startText": "First few words..."}\n  ]\n}\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown formatting, no extra text.`

      const structureResponse = await callGeminiAPI(structurePrompt)
      const structure = parseAIResponse(structureResponse)

      const state = {
        processingId: newProcessingId,
        status: 'ready',
        testId: testId,
        rawText: rawText,
        testTitle: structure.testTitle || 'Generated Test',
        passages: structure.passages || [],
        currentPassageIndex: 0,
        generatedQuestions: [],
        totalQuestions: 0,
        createdAt: new Date(),
      }

      manualProcessingStates.set(newProcessingId, state)

      return NextResponse.json({
        success: true,
        processingId: newProcessingId,
        state: state,
      })
    }

    if (action === 'generate-next') {
      const state = manualProcessingStates.get(processingId)
      if (!state) {
        return NextResponse.json(
          { error: 'Processing state not found' },
          { status: 404 }
        )
      }

      if (state.currentPassageIndex >= state.passages.length) {
        return NextResponse.json(
          {
            error: 'All passages have been processed',
            completed: true,
          },
          { status: 400 }
        )
      }

      const currentPassage = state.passages[state.currentPassageIndex]

      // Generate questions for current passage
      const passagePrompt = `${AI_PROMPT}\n\n# Input:\n${
        state.rawText
      }\n\n# Task: Extract questions for passage ${
        state.currentPassageIndex + 1
      } (${
        currentPassage.title
      }). Focus on this specific passage and its related questions. Return VALID JSON in this EXACT format (no extra text, no markdown):\n{\n  "passage": {\n    "index": ${
        state.currentPassageIndex
      },\n    "title": "${currentPassage.title}",\n    "sectionType": "${
        currentPassage.sectionType
      }",\n    "content": "Full passage content here..."\n  },\n  "questions": [\n    {\n      "number": ${
        state.totalQuestions + 1
      },\n      "passage": "Passage content here...",\n      "question": "Question text here...",\n      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],\n      "correctOption": "B",\n      "explanation": "Explanation here..."\n    }\n  ]\n}\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown formatting, no extra text.`

      try {
        state.status = 'processing'
        const passageResponse = await callGeminiAPI(passagePrompt)
        const passageData = parseAIResponse(passageResponse)

        if (passageData.questions && passageData.questions.length > 0) {
          // Update question numbers to be sequential
          const questions = passageData.questions.map((question, index) => ({
            ...question,
            number: state.totalQuestions + index + 1,
            passage: passageData.passage?.content || question.passage || '',
          }))

          state.generatedQuestions.push(...questions)
          state.totalQuestions += questions.length

          // Save to database if testId is provided
          if (state.testId) {
            await savePassageAndQuestionsToDatabase(
              state.testId,
              passageData.passage,
              questions,
              currentPassage.sectionType
            )
          }
        }

        state.currentPassageIndex++
        state.status = 'ready'

        return NextResponse.json({
          success: true,
          state: state,
          generatedQuestions: passageData.questions || [],
          passageInfo: passageData.passage,
        })
      } catch (error) {
        state.status = 'error'
        state.error = error.message
        return NextResponse.json(
          {
            error: error.message,
            state: state,
          },
          { status: 500 }
        )
      }
    }

    if (action === 'status') {
      const state = manualProcessingStates.get(processingId)
      if (!state) {
        return NextResponse.json(
          { error: 'Processing state not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        state: state,
      })
    }

    if (action === 'cancel') {
      const state = manualProcessingStates.get(processingId)
      if (state) {
        state.status = 'cancelled'
        manualProcessingStates.delete(processingId)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in manual AI processing:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

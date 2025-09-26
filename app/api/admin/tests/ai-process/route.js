import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

    const { rawText, testTitle } = await request.json()

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { error: 'Raw text is required' },
        { status: 400 }
      )
    }

    // Prepare the prompt for Gemini
    const fullPrompt = `${AI_PROMPT}\n\n# Input:\n${rawText}`

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_API_URL, {
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
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error('Gemini API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to process with AI', details: errorData },
        { status: 500 }
      )
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Parse the AI response as JSON
    let parsedResult
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      parsedResult = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw AI response:', aiResponse)
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: aiResponse },
        { status: 500 }
      )
    }

    // Validate the parsed result
    if (
      !parsedResult.testTitle ||
      !parsedResult.sections ||
      !Array.isArray(parsedResult.sections)
    ) {
      return NextResponse.json(
        { error: 'Invalid AI response format', parsedResult },
        { status: 500 }
      )
    }

    // Process and clean the sections
    const processedSections = parsedResult.sections
      .map((section) => {
        if (
          !section.sectionType ||
          !section.questions ||
          !Array.isArray(section.questions)
        ) {
          return null
        }

        // Validate section type
        const validSectionTypes = [
          'ENGLISH',
          'GK_CA',
          'LEGAL_REASONING',
          'LOGICAL_REASONING',
          'QUANTITATIVE_TECHNIQUES',
        ]
        if (!validSectionTypes.includes(section.sectionType)) {
          return null
        }

        // Process questions
        const processedQuestions = section.questions
          .map((question, index) => {
            if (
              !question.question ||
              !question.options ||
              !Array.isArray(question.options)
            ) {
              return null
            }

            return {
              number: question.number || index + 1,
              passage: question.passage || '',
              question: question.question.trim(),
              options: question.options.map((opt) => opt.trim()),
              correctOption: question.correctOption || 'A',
              explanation: question.explanation || 'Explanation not provided',
            }
          })
          .filter(Boolean)

        return {
          sectionType: section.sectionType,
          questions: processedQuestions,
        }
      })
      .filter(Boolean)

    const result = {
      testTitle: parsedResult.testTitle || testTitle || 'AI Generated Test',
      sections: processedSections,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in AI processing:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

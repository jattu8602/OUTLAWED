import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Helper function to call Gemini API with retry logic
async function callGeminiAPI(prompt, systemPrompt = '', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt}/${retries}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} - ${response.statusText}`
        )
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error(`Gemini API attempt ${attempt} failed:`, error.message)

      if (attempt === retries) {
        throw new Error(
          `Gemini API failed after ${retries} attempts: ${error.message}`
        )
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000
      console.log(`Waiting ${waitTime}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }
}

// Helper function to extract JSON from Gemini response
function extractJSONFromResponse(responseText) {
  try {
    // First try to parse directly
    return JSON.parse(responseText)
  } catch (error) {
    console.log('Direct parsing failed, trying alternatives...')

    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        const cleanedJson = jsonMatch[1]
          .trim()
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t') // Escape tabs
        console.log(
          'Extracted from code block:',
          cleanedJson.substring(0, 200) + '...'
        )
        return JSON.parse(cleanedJson)
      } catch (parseError) {
        console.error('Failed to parse extracted JSON:', parseError)
        console.log('Raw extracted text:', jsonMatch[1].substring(0, 500))
      }
    }

    // Try to find the largest JSON object in the text
    const jsonObjectMatches = responseText.match(/\{[\s\S]*?\}/g)
    if (jsonObjectMatches) {
      // Sort by length and try the largest one first
      const sortedMatches = jsonObjectMatches.sort(
        (a, b) => b.length - a.length
      )

      for (const match of sortedMatches) {
        try {
          console.log('Trying JSON object:', match.substring(0, 200) + '...')
          return JSON.parse(match)
        } catch (parseError) {
          console.log('Failed to parse this object, trying next...')
          continue
        }
      }
    }

    console.error('Raw response text:', responseText.substring(0, 1000))
    console.log('No valid JSON found in response, returning null')
    return null
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      passageContent,
      questionTexts,
      questionExplanations,
      questionText,
      section,
    } = await request.json()

    if (!passageContent && !questionText) {
      return NextResponse.json(
        { error: 'Either passage or question content is required' },
        { status: 400 }
      )
    }

    const sectionContext = section
      ? `This content is from the ${section.replace('_', ' & ')} section.`
      : ''

    const enhancePrompt = `
    You are an expert at enhancing text readability and formatting for educational content.
    ${sectionContext}

    Please enhance the following text(s) to improve readability, structure, and visual appeal for students.

    ${passageContent ? `Original Passage:\n${passageContent}` : ''}
    ${
      questionTexts && questionTexts.length > 0
        ? `Original Questions:\n${questionTexts
            .map((text, i) => `Question ${i + 1}:\n${text}`)
            .join('\n\n')}`
        : ''
    }
    ${questionText ? `Original Question:\n${questionText}` : ''}

    ${
      questionExplanations && questionExplanations.length > 0
        ? `Original Question Explanations:
    ${questionExplanations
      .map((exp, i) => `Explanation ${i + 1}:\n${exp}`)
      .join('\n\n')}`
        : ''
    }

    Requirements:
    1. Improve paragraph structure and spacing for all texts.
    2. Add appropriate emphasis (bold, italic) for key terms and concepts.
    3. Enhance readability with better line breaks and formatting.
    4. For any mathematical content, ensure it is clear and well-formatted.
    5. Maintain the original meaning and content of all texts.
    6. Make all texts more engaging and easier to read for students.
    7. Use HTML tags for formatting (e.g., <strong>, <em>, <p>, <br>, <ul>, <li>).
    8. CRITICAL: Keep each explanation isolated to its specific question only.

    Return a JSON response with the following structure. Only include keys for the content you are enhancing (e.g., if you only receive a question, only return "enhancedQuestionText" and "questionFormatting").
    {
      "enhancedPassage": "The enhanced passage content with HTML formatting",
      "enhancedQuestionTexts": ["Enhanced text for question 1", "Enhanced text for question 2"],
      "enhancedExplanations": [
        "The enhanced explanation for question 1 with HTML formatting"
      ],
      "passageFormatting": { "hasBold": true, "hasItalic": true, "paragraphCount": 3 },
      "questionFormatting": { "hasBold": true, "hasItalic": false },
      "explanationFormatting": [ { "hasBold": true, "hasItalic": false } ]
    }

    IMPORTANT:
    - Return ONLY the JSON object, no additional text.
    - The enhanced texts should be ready for display with HTML formatting.
    - The 'enhancedExplanations' array should have the same number of items as the number of original explanations provided.
    - Each explanation must remain isolated to its specific question - do not mix content between explanations.
    `

    const systemPrompt =
      'You are an expert educational content formatter. Enhance text readability while preserving all original content. Use HTML formatting tags appropriately. Always return valid JSON with enhanced text and formatting metadata.'

    const enhanceResponse = await callGeminiAPI(enhancePrompt, systemPrompt)
    const enhanceResult = extractJSONFromResponse(enhanceResponse)

    if (!enhanceResult) {
      throw new Error('Failed to parse enhancement response')
    }

    return NextResponse.json({
      success: true,
      enhancedPassage: enhanceResult.enhancedPassage,
      enhancedQuestionTexts: enhanceResult.enhancedQuestionTexts,
      enhancedExplanations: enhanceResult.enhancedExplanations,
      passageFormatting: enhanceResult.passageFormatting,
      questionFormatting: enhanceResult.questionFormatting,
      explanationFormatting: enhanceResult.explanationFormatting,
    })
  } catch (error) {
    console.error('Error enhancing text:', error)
    return NextResponse.json(
      { error: 'Failed to enhance text', details: error.message },
      { status: 500 }
    )
  }
}

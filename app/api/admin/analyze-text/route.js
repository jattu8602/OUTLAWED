import { NextResponse } from 'next/server'

const GEMINI_API_KEY = 'AIzaSyAbCe_cnuFas5NWy2axMb40WJEBixNVVZk'
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(request) {
  try {
    const { text, questionText, section } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    // Strip HTML tags from questionText for AI analysis
    const plainQuestionText = questionText
      ? questionText.replace(/<[^>]*>/g, '')
      : 'Multiple choice question'

    // Create a prompt for the AI to analyze the text and extract options
    const prompt = `
You are an expert at creating multiple choice questions for CLAT (Common Law Admission Test) preparation.

Given the following:
- Question: "${plainQuestionText}"
- Section: ${section || 'General'}
- Text content to analyze: "${text}"

Your task is to analyze the text content and check for A , B , C , D options . The options should be:

1. Relevant to the question and section
2. same as i pasted text content
3. Well-formatted and clear

Please return ONLY a JSON array of strings containing the options, like this:
["Option 1", "Option 2", "Option 3", "Option 4"]

Do not include any explanations, just the array of options.
`

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
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error('Invalid response from Gemini API')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    // Try to extract JSON from the response
    let options = []
    try {
      // Look for JSON array in the response
      const jsonMatch = aiResponse.match(/\[.*\]/s)
      if (jsonMatch) {
        options = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, try to extract options from text
        const lines = aiResponse.split('\n').filter((line) => line.trim())
        options = lines
          .map((line) =>
            line
              .replace(/^\d+\.\s*/, '')
              .replace(/^[-*]\s*/, '')
              .trim()
          )
          .filter((option) => option.length > 0)
          .slice(0, 6)
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback: extract options from text
      const lines = aiResponse.split('\n').filter((line) => line.trim())
      options = lines
        .map((line) =>
          line
            .replace(/^\d+\.\s*/, '')
            .replace(/^[-*]\s*/, '')
            .trim()
        )
        .filter((option) => option.length > 0)
        .slice(0, 6)
    }

    // Ensure we have at least 2 options
    if (options.length < 2) {
      options = ['Option A', 'Option B', 'Option C', 'Option D']
    }

    // Limit to 6 options maximum
    options = options.slice(0, 6)

    return NextResponse.json({
      success: true,
      options: options,
      originalResponse: aiResponse,
    })
  } catch (error) {
    console.error('Error in analyze-text API:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze text',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

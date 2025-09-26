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
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
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

    // Try to find JSON array
    const jsonArrayMatch = responseText.match(/\[[\s\S]*?\]/)
    if (jsonArrayMatch) {
      try {
        const cleanedArray = jsonArrayMatch[0]
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t') // Escape tabs
        console.log(
          'Trying JSON array:',
          cleanedArray.substring(0, 200) + '...'
        )
        return JSON.parse(cleanedArray)
      } catch (parseError) {
        console.error('Failed to parse JSON array:', parseError)
      }
    }

    // Last resort: try to clean and parse the entire response
    try {
      const cleanedResponse = responseText
        .replace(/^[^{[]*/, '') // Remove text before first { or [
        .replace(/[^}\]]*$/, '') // Remove text after last } or ]
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t') // Escape tabs
        .trim()

      if (cleanedResponse) {
        console.log(
          'Trying cleaned response:',
          cleanedResponse.substring(0, 200) + '...'
        )
        return JSON.parse(cleanedResponse)
      }
    } catch (parseError) {
      console.error('Failed to parse cleaned response:', parseError)
    }

    console.error('Raw response text:', responseText.substring(0, 1000))
    console.log('No valid JSON found in response, returning null')
    return null
  }
}

// Helper function to convert option letters to exact option text
function convertOptionLetterToText(optionLetter, options) {
  if (!optionLetter || !options || !Array.isArray(options)) {
    return optionLetter
  }

  // Remove common prefixes and clean the option letter
  const cleanLetter = optionLetter
    .toLowerCase()
    .replace(/^(option\s*)?([a-d])$/i, '$2')

  // Map letters to array indices
  const letterToIndex = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 }
  const index = letterToIndex[cleanLetter]

  if (index !== undefined && options[index]) {
    return options[index]
  }

  // If no match found, return original
  return optionLetter
}

// Helper function to find the exact option text that matches the AI's answer
function normalizeCorrectAnswer(aiAnswer, options) {
  if (!aiAnswer || !options || !Array.isArray(options)) {
    return aiAnswer
  }

  const trimmedAiAnswer = aiAnswer.trim()

  // 1. Direct match (if AI returns the full correct option text)
  const directMatch = options.find((o) => o.trim() === trimmedAiAnswer)
  if (directMatch) {
    return directMatch
  }

  // 2. Match text content, ignoring prefixes like (a) or a.
  const aiAnswerWithoutPrefix = trimmedAiAnswer
    .replace(/^\s*\([a-z]\)\s*|\s*[a-z][\.\)]\s*/i, '')
    .trim()
  for (const option of options) {
    const optionWithoutPrefix = option
      .replace(/^\s*\([a-z]\)\s*|\s*[a-z][\.\)]\s*/i, '')
      .trim()
    if (optionWithoutPrefix === aiAnswerWithoutPrefix) {
      return option // Return the original option string from the list
    }
  }

  // 3. Fallback for partial match: if an option contains the AI answer
  const partialMatch = options.find((o) => o.includes(trimmedAiAnswer))
  if (partialMatch) {
    return partialMatch
  }

  // 4. Fallback for letter-only answer (e.g., "a", "(b)")
  const letterMatch = convertOptionLetterToText(trimmedAiAnswer, options)
  if (letterMatch !== trimmedAiAnswer) {
    return letterMatch
  }

  // 5. If no match, return original AI answer for debugging
  return aiAnswer
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, testId, selectedSection } = await request.json()

    if (!text || !testId) {
      return NextResponse.json(
        { error: 'Text and testId are required' },
        { status: 400 }
      )
    }

    // Step 1: Analyze the text structure
    const passageChunks = text
      .split(/(?=PASSAGE – [IVXLCDM\d]+)/i)
      .map((s) => s.trim())
      .filter(Boolean)

    if (passageChunks.length === 0 && text.trim()) {
      passageChunks.push(text)
    }

    // Extract answers section separately if it exists
    const answersSectionMatch = text.match(
      /(answers\s*-\s*and\s*explanations\s*-[\s\S]*)/i
    )
    let providedAnswers = {}

    if (answersSectionMatch) {
      console.log('Found answers section, extracting...')
      const answersText = answersSectionMatch[1]
      // Parse the answers section to extract question answers
      // Try multiple patterns to handle different formats
      let questionMatches = answersText.match(
        /q(\d+):[\s\S]*?question_number:\s*(\d+)[\s\S]*?answer:\s*([^\n]+)[\s\S]*?explanation:\s*([^\n]+)/gi
      )

      // If no matches with the first pattern, try a simpler pattern
      if (!questionMatches) {
        questionMatches = answersText.match(
          /q(\d+):[\s\S]*?answer:\s*([^\n]+)[\s\S]*?explanation:\s*([^\n]+)/gi
        )
      }

      if (questionMatches) {
        console.log(
          `Found ${questionMatches.length} question matches in answers section`
        )
        questionMatches.forEach((match) => {
          // Try the full pattern first
          let qMatch = match.match(
            /q(\d+):[\s\S]*?question_number:\s*(\d+)[\s\S]*?answer:\s*([^\n]+)[\s\S]*?explanation:\s*([^\n]+)/i
          )

          if (qMatch) {
            const questionNum = parseInt(qMatch[2])
            const answer = qMatch[3].trim()
            const explanation = qMatch[4].trim()
            providedAnswers[questionNum] = { answer, explanation }
            console.log(`Extracted answer for Q${questionNum}: ${answer}`)
          } else {
            // Try the simpler pattern
            qMatch = match.match(
              /q(\d+):[\s\S]*?answer:\s*([^\n]+)[\s\S]*?explanation:\s*([^\n]+)/i
            )
            if (qMatch) {
              const questionNum = parseInt(qMatch[1])
              const answer = qMatch[2].trim()
              const explanation = qMatch[3].trim()
              providedAnswers[questionNum] = { answer, explanation }
              console.log(`Extracted answer for Q${questionNum}: ${answer}`)
            }
          }
        })
      } else {
        console.log('No question matches found in answers section')
        console.log('Answers text preview:', answersText.substring(0, 500))
      }
    } else {
      console.log('No answers section found in text')
    }

    const analysisResult = {
      sections: [],
      summary: {
        totalPassages: 0,
        totalQuestions: 0,
        sectionsDetected: [],
        hasAnswers: false,
        hasExplanations: false,
        hasTables: false,
        hasImages: false,
      },
    }

    const systemPrompt =
      "You are an expert at analyzing test content and extracting structured data. Always return valid JSON. For mathematical content, ensure all numbers, ratios, and percentages are properly formatted as strings in the JSON. Do not include any text outside the JSON structure. IMPORTANT: Group related content together - if directions, data, and questions are related, put them in the same passage. Don't create unnecessary separate passages. CRITICAL: If the text contains provided answers and explanations (like 'answers - and explanations -' or 'questions:' sections), extract and use them exactly as provided. Do not generate new answers if they are already given in the text."

    for (const [index, chunk] of passageChunks.entries()) {
      const passageNumber = index + 1
      console.log(
        `Processing chunk ${passageNumber} of ${passageChunks.length}`
      )
      const sectionContext = selectedSection
        ? `This content is from the ${selectedSection.replace(
            '_',
            ' & '
          )} section.`
        : ''

      const analysisPrompt = `
      Analyze the following test text and extract structured information. The text contains passages, questions, and may include provided answers and explanations.
      ${sectionContext}

      IMPORTANT: Group related content together. For example:
      - If you see "DIRECTIONS FOR QUESTIONS (Q.7 TO Q.12): Study the table given below" followed by table data and questions 7-12, put ALL of this in ONE passage
      - Don't create separate passages for directions and data when they belong together
      - A passage can contain description + table data + questions that reference that data

      CRITICAL: Look for provided answers and explanations in the text:
      - If you see sections like "answers - and explanations -" or "questions:" followed by structured answer data, EXTRACT THESE
      - Look for patterns like "q1:", "q2:", etc. with provided answers and explanations
      - Example format to look for:
          question_number: 1
          answer: (b) Remove illegal foreigners by force
          explanation: The Passport (Entry into India) Act, 1920 empowers authorities to remove illegal foreigners, ensuring control over unlawful migration.
      - Match the provided answers to the corresponding questions by question number
      - Use the provided explanations exactly as given, don't generate new ones
      - If answers/explanations are provided, use them instead of generating new ones

      PASSAGE NUMBERING: This is chunk ${passageNumber} of the text. Set the passageNumber to ${passageNumber} for all passages in this chunk.

      Text to analyze:
      ${chunk}

      Please provide a JSON response with the following structure:
      {
        "sections": [
          {
            "name": "ENGLISH|GK_CA|LEGAL_REASONING|LOGICAL_REASONING|QUANTITATIVE_TECHNIQUES",
            "passages": [
              {
                "passageNumber": ${passageNumber},
                "content": "full passage content here",
                "hasImage": false,
                "imageUrls": [],
                "isTable": false,
                "tableData": null,
                "questions": [
                  {
                    "questionNumber": 1,
                    "questionText": "question text here",
                    "options": ["option a", "option b", "option c", "option d"],
                    "correctAnswer": "exact option text (if provided, must match an option exactly, including letter)",
                    "explanation": "explanation if provided, otherwise null",
                    "isTable": false,
                    "tableData": null
                  }
                ]
              }
            ]
          }
        ]
      }

      Rules:
      1. ${
        selectedSection
          ? `This content is specifically from the ${selectedSection.replace(
              '_',
              ' & '
            )} section. Use "${selectedSection}" as the section name.`
          : 'Identify sections based on content (English, GK/CA, Legal Reasoning, Logical Reasoning, Quantitative Techniques)'
      }
      2. SMART PASSAGE ORGANIZATION:
         - Group related content together in ONE passage (directions + data + questions that reference that data)
         - If you see "DIRECTIONS FOR QUESTIONS (Q.X TO Q.Y): Study the table given below" followed by tabular data and then questions Q.X to Q.Y, put ALL of this in ONE passage
         - A passage can contain: description text + table data + questions that reference that data
         - Don't create separate passages for directions and data when they belong together
      3. Extract passages and their content
      4. Extract questions with options
      5. ANSWER EXTRACTION - CRITICAL:
         - FIRST: Look for provided answers in the text (sections like "answers - and explanations -" or "questions:")
         - If provided answers exist, use them EXACTLY as given
         - Match answers to questions by question number (q1, q2, etc.)
         - If correct answers are provided, include the EXACT OPTION TEXT, including the option letter (e.g., '(a) some text'). It must match one of the options.
         - If no provided answers exist, then generate answers based on passage content
      6. EXPLANATION EXTRACTION - CRITICAL:
         - FIRST: Look for provided explanations in the text
         - If provided explanations exist, use them EXACTLY as given
         - Each explanation must belong ONLY to its specific question
         - Look for clear boundaries between questions (Q1, Q2, Q3, etc.)
         - If you see text that looks like an explanation, it belongs to the PREVIOUS question only
         - Do NOT include explanation text that appears after a new question number
         - If explanation text continues beyond the next question, STOP at the question boundary
         - Each question should have its own isolated explanation field
         - If no provided explanations exist, then generate explanations based on passage content
      7. If answers/explanations are missing and not provided in the text, set them to null
      8. Return valid JSON only, no additional text
      9. IMPORTANT: For correctAnswer, use the full option text, including the option letter. It must be an exact match to one of the options.
      10. For mathematical content: ensure all ratios, percentages, and numbers are properly quoted as strings
      11. CRITICAL: Return ONLY the JSON object, no explanatory text before or after
      12. IMAGE DETECTION:
         - For PASSAGES: If a passage contains image references or mentions images:
           * Set "hasImage": true for that passage
           * Extract image URLs and add them to "imageUrls": ["url1", "url2"]
           * Look for patterns like "see the image below", "refer to the figure", or image URLs
      13. TABLE DETECTION:
         - For PASSAGES: If a passage contains tabular data or structured information that should be displayed as a table:
           * Set "isTable": true for that passage
           * Extract the table data and format it as "tableData": [["row1col1", "row1col2"], ["row2col1", "row2col2"]]
           * Look for patterns like "Study the table given below", "Based on the information in the table", or structured data with rows and columns
           * For data tables, extract all rows and columns as arrays of strings
           * Include ALL questions that reference this table data in the SAME passage
         - For QUESTIONS: If a question references tabular data or contains structured data that should be displayed as a table:
           * Set "isTable": true for that question
           * Extract the table data and format it as "tableData": [["row1col1", "row1col2"], ["row2col1", "row2col2"]]
           * Look for patterns like "Study the table given below", "Based on the information in the table", or structured data with rows and columns
           * For data tables, extract all rows and columns as arrays of strings
      14. ${
        selectedSection === 'QUANTITATIVE_TECHNIQUES'
          ? 'For Quantitative Techniques: Pay special attention to mathematical calculations, ratios, percentages, and numerical data. Ensure all mathematical expressions are properly formatted. Look for tabular data in questions about statistics, comparisons, or structured information.'
          : ''
      }
      `
      const analysisResponse = await callGeminiAPI(analysisPrompt, systemPrompt)
      const chunkResult = extractJSONFromResponse(analysisResponse)

      if (!chunkResult || !chunkResult.sections) {
        console.error(
          'AI response did not contain a valid JSON with a "sections" property for a chunk.'
        )
        console.error('Parsed result for chunk:', chunkResult)
        console.error(
          'Raw AI response for chunk:',
          analysisResponse.substring(0, 2000)
        )
        return NextResponse.json(
          {
            error: 'AI response was not in the expected format for a passage.',
            details:
              'Could not find a valid JSON structure with a "sections" property.',
            rawResponse: analysisResponse,
          },
          { status: 500 }
        )
      }

      // Merge the result from the chunk into the final result
      chunkResult.sections.forEach((section) => {
        let targetSection = analysisResult.sections.find(
          (s) => s.name === section.name
        )
        if (!targetSection) {
          targetSection = { name: section.name, passages: [] }
          analysisResult.sections.push(targetSection)
        }
        // Add passages to the target section
        section.passages.forEach((p) => {
          console.log(
            `Adding passage ${p.passageNumber} to section ${section.name}`
          )
          targetSection.passages.push(p)
        })
      })
    }

    // Step 2: Generate answers and explanations for questions that don't have them
    const questionsNeedingAnswers = []
    const questionsNeedingExplanations = []

    analysisResult.sections.forEach((section) => {
      section.passages.forEach((passage) => {
        passage.questions.forEach((question) => {
          if (!question.correctAnswer) {
            questionsNeedingAnswers.push({
              ...question,
              passageContent: passage.content,
              section: section.name,
            })
          }
          if (!question.explanation) {
            questionsNeedingExplanations.push({
              ...question,
              passageContent: passage.content,
              section: section.name,
            })
          }
        })
      })
    })

    // Generate answers for questions without them
    if (questionsNeedingAnswers.length > 0) {
      const answerPrompt = `
      For each question below, provide the correct answer and a brief explanation.

      Questions:
      ${questionsNeedingAnswers
        .map(
          (q, index) => `
      Question ${index + 1}:
      Passage: ${q.passageContent}
      Question: ${q.questionText}
      Options: ${q.options
        .map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`)
        .join(', ')}
      `
        )
        .join('\n')}

      Return a JSON array where each object has:
      {
        "questionIndex": 0,
        "correctAnswer": "exact option text here, including the option letter (e.g., '(a) text...'). It must match one of the options.",
        "explanation": "brief explanation of why this is correct"
      }

      IMPORTANT: For correctAnswer, provide the EXACT TEXT of the correct option, including the option letter (e.g., \"(a) some text\"). The value must exactly match one of the provided options.
      `

      const answerSystemPrompt =
        'You are an expert test question analyzer. Provide accurate answers based on the passage content. CRITICAL: Always return the EXACT OPTION TEXT, never return option letters like "a", "b", "c", "d" or "option a", "option b", etc.'
      const answerResponse = await callGeminiAPI(
        answerPrompt,
        answerSystemPrompt
      )
      const generatedAnswers = extractJSONFromResponse(answerResponse)

      // Apply generated answers back to the analysis result
      generatedAnswers.forEach((answer) => {
        const questionIndex = answer.questionIndex
        if (questionsNeedingAnswers[questionIndex]) {
          const question = questionsNeedingAnswers[questionIndex]

          // Convert option letter to exact text if needed
          const correctAnswer = normalizeCorrectAnswer(
            answer.correctAnswer,
            question.options
          )

          questionsNeedingAnswers[questionIndex].correctAnswer = correctAnswer
          questionsNeedingAnswers[questionIndex].explanation =
            answer.explanation
        }
      })
    }

    // Step 3: Generate explanations for questions that don't have them
    if (questionsNeedingExplanations.length > 0) {
      const explanationPrompt = `
      For each question below, provide a detailed explanation of the correct answer.

      Questions:
      ${questionsNeedingExplanations
        .map(
          (q, index) => `
      Question ${index + 1}:
      Passage: ${q.passageContent}
      Question: ${q.questionText}
      Options: ${q.options.join(', ')}
      Correct Answer: ${q.correctAnswer || 'Not provided'}
      `
        )
        .join('\n')}

      Return a JSON array where each object has:
      {
        "questionIndex": 0,
        "explanation": "detailed explanation of why the correct answer is right and why others are wrong"
      }

      IMPORTANT EXPLANATION RULES:
      - Each explanation must be specific to ONLY that question
      - Do not reference other questions in your explanation
      - Keep explanations focused and concise
      - Each explanation should be self-contained
      - Do not include content that belongs to other questions
      `

      const explanationSystemPrompt =
        'You are an expert educator. Provide clear, detailed explanations for test questions. Each explanation must be isolated to its specific question only.'
      const explanationResponse = await callGeminiAPI(
        explanationPrompt,
        explanationSystemPrompt
      )
      const generatedExplanations = extractJSONFromResponse(explanationResponse)

      // Apply generated explanations back to the analysis result
      if (Array.isArray(generatedExplanations)) {
        generatedExplanations.forEach((explanation) => {
          const questionIndex = explanation.questionIndex
          if (questionsNeedingExplanations[questionIndex]) {
            questionsNeedingExplanations[questionIndex].explanation =
              explanation.explanation
          }
        })
      } else {
        console.log(
          'Generated explanations is not an array:',
          generatedExplanations
        )
        // If explanation generation fails, continue without explanations
      }
    }

    // Update the analysis result with generated content
    let questionCounter = 0
    analysisResult.sections.forEach((section) => {
      section.passages.forEach((passage) => {
        passage.questions.forEach((question) => {
          // First, apply provided answers if they exist
          if (providedAnswers[question.questionNumber]) {
            const providedAnswer = providedAnswers[question.questionNumber]
            question.correctAnswer = providedAnswer.answer
            question.explanation = providedAnswer.explanation
            console.log(
              `Applied provided answer for Q${question.questionNumber}: ${providedAnswer.answer}`
            )
          } else if (
            !question.correctAnswer &&
            questionsNeedingAnswers[questionCounter]
          ) {
            question.correctAnswer =
              questionsNeedingAnswers[questionCounter].correctAnswer
          } else if (question.correctAnswer) {
            // Convert existing correct answer from option letter to exact text if needed
            question.correctAnswer = normalizeCorrectAnswer(
              question.correctAnswer,
              question.options
            )
          }

          if (
            !question.explanation &&
            questionsNeedingExplanations[questionCounter]
          ) {
            question.explanation =
              questionsNeedingExplanations[questionCounter].explanation
          }
          questionCounter++
        })
      })
    })

    // Update summary
    const sectionsDetected = new Set()
    analysisResult.sections.forEach((section) => {
      sectionsDetected.add(section.name)
      analysisResult.summary.totalPassages += section.passages.length
      section.passages.forEach((passage) => {
        analysisResult.summary.totalQuestions += passage.questions.length
      })
    })
    analysisResult.summary.sectionsDetected = Array.from(sectionsDetected)

    analysisResult.summary.hasAnswers = analysisResult.sections.every(
      (section) =>
        section.passages.every((passage) =>
          passage.questions.every((question) => question.correctAnswer)
        )
    )
    analysisResult.summary.hasExplanations = analysisResult.sections.every(
      (section) =>
        section.passages.every((passage) =>
          passage.questions.every((question) => question.explanation)
        )
    )
    analysisResult.summary.hasTables = analysisResult.sections.some((section) =>
      section.passages.some(
        (passage) =>
          passage.isTable ||
          passage.questions.some((question) => question.isTable)
      )
    )
    analysisResult.summary.hasImages = analysisResult.sections.some((section) =>
      section.passages.some(
        (passage) =>
          passage.hasImage ||
          passage.questions.some((question) => question.imageUrls?.length > 0)
      )
    )

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    })
  } catch (error) {
    console.error('Error analyzing text:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text', details: error.message },
      { status: 500 }
    )
  }
}

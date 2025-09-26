/**
 * Universal Scoring System for CLAT Tests
 *
 * Formula: Percentage = ((C - 0.25 * W) / T) * 100
 * Where:
 * T = Total number of questions
 * C = Number of correct answers
 * W = Number of wrong answers
 * U = Number of unattempted answers
 */

/**
 * Calculate test score using the universal CLAT formula
 * @param {Object} params - Scoring parameters
 * @param {number} params.totalQuestions - Total number of questions (T)
 * @param {number} params.correctAnswers - Number of correct answers (C)
 * @param {number} params.wrongAnswers - Number of wrong answers (W)
 * @param {number} params.unattempted - Number of unattempted questions (U)
 * @returns {Object} Score calculation results
 */
export function calculateTestScore({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  unattempted,
}) {
  // Validate inputs
  if (totalQuestions <= 0) {
    throw new Error('Total questions must be greater than 0')
  }

  if (correctAnswers < 0 || wrongAnswers < 0 || unattempted < 0) {
    throw new Error('Answer counts cannot be negative')
  }

  if (correctAnswers + wrongAnswers + unattempted !== totalQuestions) {
    console.warn(
      'Answer counts do not sum to total questions. Using provided values.'
    )
  }

  // Calculate marks obtained using the formula: C - 0.25 * W
  const marksObtained = correctAnswers - 0.25 * wrongAnswers

  // Calculate percentage: (marksObtained / totalQuestions) * 100
  const percentage = (marksObtained / totalQuestions) * 100

  // Round to 2 decimal places for display
  const roundedPercentage = Math.round(percentage * 100) / 100

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unattempted,
    marksObtained,
    percentage: roundedPercentage,
    // Additional calculated fields for compatibility
    totalMarks: totalQuestions, // Total possible marks equals total questions
    score: roundedPercentage, // Alias for percentage
    percentageScore: roundedPercentage, // Another alias for compatibility
  }
}

/**
 * Calculate score from test attempt data
 * @param {Object} testAttempt - Test attempt object from database
 * @returns {Object} Score calculation results
 */
export function calculateScoreFromAttempt(testAttempt, totalQuestionsFromTest) {
  const totalQuestions =
    testAttempt.totalQuestions || totalQuestionsFromTest || 0
  const correctAnswers = testAttempt.correctAnswers || 0
  const wrongAnswers = testAttempt.wrongAnswers || 0

  // If `unattempted` is missing from the attempt, calculate it.
  const unattempted =
    typeof testAttempt.unattempted === 'number'
      ? testAttempt.unattempted
      : totalQuestions - (correctAnswers + wrongAnswers)

  return calculateTestScore({
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unattempted,
  })
}

/**
 * Calculate score from individual answers
 * @param {Array} answers - Array of answer objects
 * @param {number} totalQuestions - Total number of questions in test
 * @returns {Object} Score calculation results
 */
export function calculateScoreFromAnswers(answers, totalQuestions) {
  let correctAnswers = 0
  let wrongAnswers = 0
  let unattempted = 0

  answers.forEach((answer) => {
    if (!answer.selectedOption || answer.selectedOption.length === 0) {
      unattempted++
    } else if (answer.isCorrect === true) {
      correctAnswers++
    } else if (answer.isCorrect === false) {
      wrongAnswers++
    } else {
      // If isCorrect is null/undefined, treat as unattempted
      unattempted++
    }
  })

  return calculateTestScore({
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unattempted,
  })
}

/**
 * Format score for display
 * @param {number} percentage - Percentage score
 * @param {Object} options - Display options
 * @returns {string} Formatted score string
 */
export function formatScore(percentage, options = {}) {
  const {
    showDecimals = true,
    showPercentage = true,
    maxDecimals = 2,
  } = options

  let formattedScore = percentage

  if (showDecimals) {
    formattedScore = Number(percentage).toFixed(maxDecimals)
  } else {
    formattedScore = Math.round(percentage)
  }

  return showPercentage ? `${formattedScore}%` : formattedScore
}

/**
 * Get score grade based on percentage
 * @param {number} percentage - Percentage score
 * @returns {Object} Grade information
 */
export function getScoreGrade(percentage) {
  if (percentage >= 90) {
    return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' }
  } else if (percentage >= 80) {
    return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' }
  } else if (percentage >= 70) {
    return { grade: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  } else if (percentage >= 60) {
    return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  } else if (percentage >= 50) {
    return { grade: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  } else if (percentage >= 40) {
    return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  } else if (percentage >= 30) {
    return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' }
  } else {
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' }
  }
}

/**
 * Validate scoring data
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export function validateScoringData(data) {
  const errors = []

  if (!data.totalQuestions || data.totalQuestions <= 0) {
    errors.push('Total questions must be a positive number')
  }

  if (data.correctAnswers < 0) {
    errors.push('Correct answers cannot be negative')
  }

  if (data.wrongAnswers < 0) {
    errors.push('Wrong answers cannot be negative')
  }

  if (data.unattempted < 0) {
    errors.push('Unattempted questions cannot be negative')
  }

  const total =
    (data.correctAnswers || 0) +
    (data.wrongAnswers || 0) +
    (data.unattempted || 0)
  if (total > data.totalQuestions) {
    errors.push('Sum of answers exceeds total questions')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Example usage and test cases from scorerules.mdc
export const exampleCases = [
  {
    name: 'Case 1',
    totalQuestions: 12,
    correctAnswers: 1,
    wrongAnswers: 1,
    unattempted: 10,
    expectedPercentage: 6.25,
  },
  {
    name: 'Case 2',
    totalQuestions: 24,
    correctAnswers: 1,
    wrongAnswers: 1,
    unattempted: 22,
    expectedPercentage: 3.13,
  },
  {
    name: 'Case 3',
    totalQuestions: 20,
    correctAnswers: 5,
    wrongAnswers: 5,
    unattempted: 10,
    expectedPercentage: 18.75,
  },
  {
    name: 'Case 4',
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    unattempted: 0,
    expectedPercentage: 62.5,
  },
]

// Test the examples
export function testScoringExamples() {
  console.log('Testing scoring examples from scorerules.mdc:')

  exampleCases.forEach((testCase) => {
    const result = calculateTestScore({
      totalQuestions: testCase.totalQuestions,
      correctAnswers: testCase.correctAnswers,
      wrongAnswers: testCase.wrongAnswers,
      unattempted: testCase.unattempted,
    })

    const passed =
      Math.abs(result.percentage - testCase.expectedPercentage) < 0.01
    console.log(
      `${testCase.name}: ${passed ? '✅' : '❌'} Expected: ${
        testCase.expectedPercentage
      }%, Got: ${result.percentage}%`
    )
  })
}

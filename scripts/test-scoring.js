/**
 * Test script to verify the universal scoring formula
 * Run with: node scripts/test-scoring.js
 */

import {
  calculateTestScore,
  exampleCases,
  testScoringExamples,
} from '../lib/utils/scoringUtils.js'

console.log('🧪 Testing Universal CLAT Scoring Formula')
console.log('==========================================\n')

// Test the examples from scorerules.mdc
testScoringExamples()

console.log('\n📊 Additional Test Cases:')
console.log('========================')

// Additional test cases
const additionalTests = [
  {
    name: 'Perfect Score',
    totalQuestions: 20,
    correctAnswers: 20,
    wrongAnswers: 0,
    unattempted: 0,
    expectedPercentage: 100,
  },
  {
    name: 'All Wrong',
    totalQuestions: 10,
    correctAnswers: 0,
    wrongAnswers: 10,
    unattempted: 0,
    expectedPercentage: -25, // (0 - 0.25*10)/10 * 100 = -2.5/10 * 100 = -25%
  },
  {
    name: 'All Unattempted',
    totalQuestions: 15,
    correctAnswers: 0,
    wrongAnswers: 0,
    unattempted: 15,
    expectedPercentage: 0,
  },
  {
    name: 'Mixed Performance',
    totalQuestions: 50,
    correctAnswers: 30,
    wrongAnswers: 15,
    unattempted: 5,
    expectedPercentage: 52.5, // (30 - 0.25*15)/50 * 100 = 26.25/50 * 100 = 52.5%
  },
]

additionalTests.forEach((testCase) => {
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
  console.log(
    `  Details: ${result.correctAnswers} correct, ${result.wrongAnswers} wrong, ${result.unattempted} unattempted`
  )
  console.log(`  Marks: ${result.marksObtained}/${result.totalMarks}`)
  console.log('')
})

console.log('🎯 Formula Verification:')
console.log('=======================')
console.log('Formula: Percentage = ((C - 0.25 * W) / T) * 100')
console.log('Where:')
console.log('  T = Total questions')
console.log('  C = Correct answers')
console.log('  W = Wrong answers')
console.log('  U = Unattempted questions')
console.log('')
console.log('✅ All tests completed!')

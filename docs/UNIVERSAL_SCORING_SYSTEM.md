# Universal CLAT Scoring System

## Overview

This document describes the universal scoring system implemented across the CLAT preparation platform. The system ensures consistent scoring calculations across all test pages, APIs, and evaluation components.

## Formula

The universal CLAT scoring formula is:

```
Percentage = ((C - 0.25 * W) / T) * 100
```

Where:

- **T** = Total number of questions
- **C** = Number of correct answers
- **W** = Number of wrong answers
- **U** = Number of unattempted questions

## Implementation

### Core Utility Function

The scoring logic is centralized in `/lib/utils/scoringUtils.js`:

```javascript
import { calculateTestScore } from '@/lib/utils/scoringUtils'

const result = calculateTestScore({
  totalQuestions: 20,
  correctAnswers: 15,
  wrongAnswers: 3,
  unattempted: 2,
})

console.log(result.percentage) // 71.25%
```

### Key Functions

1. **`calculateTestScore(params)`** - Main scoring function
2. **`calculateScoreFromAttempt(testAttempt)`** - Calculate from database attempt
3. **`calculateScoreFromAnswers(answers, totalQuestions)`** - Calculate from answer array
4. **`formatScore(percentage, options)`** - Format for display
5. **`getScoreGrade(percentage)`** - Get grade based on percentage

## Database Schema

The `TestAttempt` model includes all necessary fields:

```prisma
model TestAttempt {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  score        Float?      // Legacy field for backward compatibility
  percentage   Float?      // New universal percentage field
  totalQuestions Int?      // Total questions (T)
  correctAnswers Int?      // Correct answers (C)
  wrongAnswers  Int?       // Wrong answers (W)
  unattempted   Int?       // Unattempted questions (U)
  // ... other fields
}
```

## API Integration

### Test Submission API

The `/api/tests/[id]/submit` endpoint now uses the universal formula:

```javascript
// Calculate score using universal CLAT formula
const scoreCalculation = calculateTestScore({
  totalQuestions: test.questions.length,
  correctAnswers,
  wrongAnswers,
  unattempted: unattemptedQuestions,
})

const percentageScore = scoreCalculation.percentage
```

### Results API

The `/api/tests/[id]/results` endpoint returns consistent scoring data:

```javascript
const scoreCalculation = calculateScoreFromAttempt(testAttempt)
const percentageScore = scoreCalculation.percentage
```

## Frontend Integration

### Test Cards

Test cards display scores using the new system:

```javascript
lastScore: test.testAttempts.length > 0
  ? Math.round(
      (test.testAttempts[0].percentage ?? test.testAttempts[0].score ?? 0) * 100
    ) / 100
  : null
```

### Evaluation Pages

Evaluation components use the consistent scoring data:

- `TestStatisticsSidebar` - Displays overall score and statistics
- `QuestionDisplay` - Shows individual question marks
- `EvaluationHeader` - Shows test summary

## Examples

### Example 1: Basic Test

- Total Questions: 12
- Correct: 1
- Wrong: 1
- Unattempted: 10
- **Result: 6.25%**

### Example 2: Mixed Performance

- Total Questions: 20
- Correct: 5
- Wrong: 5
- Unattempted: 10
- **Result: 18.75%**

### Example 3: Good Performance

- Total Questions: 10
- Correct: 7
- Wrong: 3
- Unattempted: 0
- **Result: 62.5%**

## Migration Notes

### Backward Compatibility

The system maintains backward compatibility:

- Legacy `score` field is still populated
- New `percentage` field is the primary source
- Fallback logic: `percentage ?? score ?? 0`

### Data Migration

Existing test attempts will continue to work:

- Old attempts use the `score` field
- New attempts use the `percentage` field
- Both are calculated using the same formula

## Testing

Run the scoring tests:

```bash
node scripts/test-scoring.js
```

This verifies:

- All examples from scorerules.mdc
- Edge cases (perfect score, all wrong, all unattempted)
- Formula accuracy

## Benefits

1. **Consistency** - Same formula across all components
2. **Accuracy** - Matches official CLAT marking scheme
3. **Maintainability** - Centralized scoring logic
4. **Transparency** - Clear formula and examples
5. **Flexibility** - Easy to modify if marking scheme changes

## Future Enhancements

1. **Section-wise Scoring** - Calculate scores by subject
2. **Time-based Analysis** - Factor in time spent per question
3. **Difficulty Weighting** - Adjust scores based on question difficulty
4. **Comparative Analysis** - Compare with other students
5. **Performance Trends** - Track improvement over time

## Support

For questions or issues with the scoring system:

1. Check the test script output
2. Verify database field values
3. Review API response data
4. Check frontend component props

The universal scoring system ensures fair and consistent evaluation across the entire CLAT preparation platform.

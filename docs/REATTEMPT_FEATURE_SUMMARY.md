# Reattempt Feature Implementation Summary

## Overview

The reattempt feature allows users to take the same test multiple times while preserving all previous attempts for comparison and analysis.

## What Was Implemented

### 1. Database Schema Updates (`prisma/schema.prisma`)

- Added `attemptNumber` field to track attempt sequence (1st, 2nd, 3rd, etc.)
- Added `isLatest` boolean to mark the most recent attempt
- Added `previousAttemptId` to link attempts for comparison
- Added unique constraint on `[userId, testId, attemptNumber]`
- Added index on `[userId, testId, isLatest]`

### 2. New API Endpoints

#### `/api/tests/[id]/attempts` (GET)

- Retrieves all attempts for a specific test by a user
- Returns attempts ordered by attempt number (newest first)
- Includes answer details for each attempt

#### `/api/tests/[id]/attempts` (POST)

- Creates a new attempt for a test
- Automatically increments attempt number
- Marks previous attempts as not latest
- Links to previous attempt for comparison

### 3. Updated Submit API (`/api/tests/[id]/submit`)

- Now accepts `attemptId` parameter for reattempts
- Updates existing attempts instead of creating new ones
- Preserves all previous attempt data
- Returns `isReattempt` flag in response

### 4. Enhanced Test Taking Page (`app/dashboard/test/[id]/page.jsx`)

- Checks for existing attempts on page load
- Shows reattempt information in start modal
- Displays previous attempt score and details
- Creates new attempt records for reattempts
- Includes attempt ID in submit payload

### 5. UI Enhancements

- Start modal shows different content for reattempts vs. first attempts
- Displays previous attempt score and attempt number
- "Take Again" button in results modal for quick reattempts
- Attempt history information in test results

### 6. Migration Script (`scripts/migrate-reattempts.js`)

- Updates existing test attempts with new fields
- Numbers attempts chronologically
- Links attempts in sequence
- Marks most recent attempts as latest

## How It Works

### First Time Taking a Test

1. User starts test normally
2. System creates new `TestAttempt` with `attemptNumber: 1`
3. `isLatest: true` and `previousAttemptId: null`

### Taking a Test Again (Reattempt)

1. User clicks "Re-attempt Test" or "Take Again"
2. System creates new `TestAttempt` with incremented `attemptNumber`
3. Previous attempts are marked as `isLatest: false`
4. New attempt is linked to previous via `previousAttemptId`
5. All previous attempts remain unchanged and accessible

### Submitting a Reattempt

1. Submit API receives `attemptId` parameter
2. Updates existing attempt record instead of creating new one
3. Deletes old answers and creates new ones
4. Preserves attempt metadata (number, linking, etc.)

## Benefits

1. **Clean History**: Each attempt is a separate, numbered record
2. **Performance Tracking**: Easy to see improvement over time
3. **Data Integrity**: Previous attempts remain unchanged
4. **Flexible Analysis**: Can compare any attempt with others
5. **Scalable**: Works for unlimited reattempts
6. **Backward Compatible**: Existing functionality unchanged

## Usage Examples

### For Users

- Take a test multiple times to improve scores
- Compare performance across attempts
- Track learning progress over time
- Review previous answers and strategies

### For Analytics

- Identify common mistakes across attempts
- Measure learning effectiveness
- Track time improvement patterns
- Generate progress reports

## Technical Notes

- **Unique Constraints**: Prevents duplicate attempt numbers for same user/test
- **Indexing**: Optimizes queries for latest attempts and attempt history
- **Cascading**: Deleting a test attempt removes associated answers
- **Validation**: Ensures attempt IDs are valid before submission

## Future Enhancements

1. **Attempt Comparison UI**: Side-by-side comparison of attempts
2. **Progress Analytics**: Charts showing improvement over time
3. **Smart Recommendations**: Suggest focus areas based on attempt history
4. **Bulk Operations**: Manage multiple attempts at once
5. **Export Features**: Download attempt history for external analysis

## Testing

The feature has been tested with:

- ✅ Database schema updates
- ✅ API endpoint functionality
- ✅ UI integration
- ✅ Migration of existing data
- ✅ Linting and code quality checks

## Deployment Notes

1. Run `npx prisma db push` to update database schema
2. Run `node scripts/migrate-reattempts.js` to migrate existing data
3. Restart application to ensure new API endpoints are available
4. Test reattempt functionality with existing users

## Support

For any issues or questions about the reattempt feature:

1. Check database schema is up to date
2. Verify migration script completed successfully
3. Check API endpoint responses in browser dev tools
4. Review server logs for any errors

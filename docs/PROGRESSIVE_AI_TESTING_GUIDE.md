# Progressive AI Test Creation - Testing Guide

## 🧪 Test Data Analysis

The `test.txt` file contains a comprehensive CLAT 2025 mock test with:

- **File Size**: 225,307 characters
- **Lines**: 1,926 lines
- **Passages**: 8 passages (PASSAGE-I through PASSAGE-XX)
- **Questions**: 56+ questions estimated
- **Sections**: 4 main sections identified

### Test Structure:

```json
{
  "testTitle": "CLAT 2025 Mock Test - Vidhigya India Open Mock-01",
  "sections": [
    {
      "sectionType": "ENGLISH",
      "estimatedQuestions": 34
    },
    {
      "sectionType": "GK_CA",
      "estimatedQuestions": 12
    },
    {
      "sectionType": "LEGAL_REASONING",
      "estimatedQuestions": 6
    },
    {
      "sectionType": "LOGICAL_REASONING",
      "estimatedQuestions": 6
    }
  ]
}
```

## 🚀 How to Test Progressive AI Processing

### Step 1: Setup

1. Ensure your `.env.local` has the Gemini API key:

   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

### Step 2: Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin/create-test`
2. Login with admin credentials

### Step 3: Test Progressive AI Processing

1. **Click "Create with AI"** button (purple gradient button)
2. **Fill in test information**:
   - Test Title: "CLAT 2025 Mock Test - Progressive AI Test"
   - Key Topic: "CLAT Mock Test"
   - Test Type: "FREE" or "PAID"
   - Duration: 180 minutes
3. **Paste the test.txt content** in the text area
4. **Click "Start Progressive Processing"**

### Step 4: Monitor Progress

Watch the real-time progress panel on the right:

- **Progress Bar**: Shows completion percentage
- **Questions Processed**: Live counter of processed questions
- **Current Section**: Shows which section is being processed
- **Status Updates**: Every 2 seconds

### Expected Behavior:

1. **Structure Analysis** (5-10 seconds)

   - AI analyzes the content structure
   - Determines sections and question counts
   - Updates progress to show estimated totals

2. **Section Processing** (30-60 seconds per section)

   - Processes each section individually
   - Extracts questions, passages, options, answers
   - Saves questions to database incrementally
   - Updates progress in real-time

3. **Completion** (2-5 minutes total)
   - All questions processed and saved
   - Automatic redirect to questions page
   - Success message displayed

## 🔧 Troubleshooting

### Common Issues:

1. **"Gemini API key not configured"**

   - Check your `.env.local` file
   - Restart the development server
   - Verify the API key is valid

2. **"JSON parsing error"**

   - The robust parsing function should handle this
   - Check browser console for detailed error logs
   - Try with smaller content chunks if issues persist

3. **"Processing timeout"**

   - The progressive system should avoid this
   - If it occurs, the system will show error status
   - You can cancel and retry

4. **"No questions found"**
   - Check if the content has clear question formats
   - Ensure passages and questions are properly formatted
   - Try with a smaller sample first

### Debug Information:

- Check browser developer tools console for detailed logs
- Monitor network tab for API calls
- Check server logs for backend processing details

## 📊 Expected Results

After successful processing, you should see:

- **Test created** with proper title and metadata
- **Questions saved** in the database with correct numbering
- **Sections organized** by CLAT categories
- **Passages linked** to their respective questions
- **Options and answers** properly formatted
- **Explanations generated** for questions that don't have them

## 🎯 Performance Metrics

Expected processing times:

- **Small test** (10-20 questions): 30-60 seconds
- **Medium test** (30-50 questions): 1-3 minutes
- **Large test** (50+ questions): 2-5 minutes
- **Very large test** (100+ questions): 5-10 minutes

The progressive system should handle the test.txt content (56+ questions) in approximately **2-4 minutes**.

## ✅ Success Criteria

The test is successful if:

1. ✅ Processing starts without errors
2. ✅ Progress updates in real-time
3. ✅ All sections are processed
4. ✅ Questions are saved to database
5. ✅ Redirect to questions page works
6. ✅ Questions display correctly in the admin interface

## 🔄 Testing Different Scenarios

1. **Full Test**: Use complete test.txt content
2. **Partial Test**: Use first 2-3 passages only
3. **Single Section**: Extract just English questions
4. **Malformed Content**: Test with intentionally broken formatting
5. **Large Content**: Test with very large documents

## 📝 Test Results Log

Record your test results:

- [ ] Processing starts successfully
- [ ] Real-time progress updates work
- [ ] All sections processed
- [ ] Questions saved correctly
- [ ] No timeout errors
- [ ] Redirect works properly
- [ ] Questions display in admin interface

---

**Note**: This testing guide helps verify that the progressive AI processing system works correctly with real CLAT test data and handles the timeout issues that were present in the original bulk processing approach.

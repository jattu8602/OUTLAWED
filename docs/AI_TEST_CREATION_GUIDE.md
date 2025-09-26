# AI Test Creation Feature Guide

## Overview

The AI Test Creation feature allows administrators to automatically generate test questions from raw text content (PDF/Word documents) using Google's Gemini AI. This significantly reduces the time and effort required to create comprehensive test papers.

## Features

### 1. Progressive AI Test Creation (Recommended)

- **Location**: Admin Dashboard → "Create with AI" button
- **Functionality**:
  - Paste raw test content from PDF/Word documents
  - **Progressive Processing**: Questions are generated one by one to avoid timeout issues
  - **Real-time Progress**: See live updates as questions are processed
  - **Timeout Resistant**: Designed to work within Vercel's 10-second timeout limit
  - **Resumable**: Can continue from where it left off if interrupted
  - AI automatically extracts questions, passages, options, and correct answers
  - Generates explanations for questions that don't have them
  - Organizes content by CLAT sections (English, GK/CA, Legal Reasoning, Logical Reasoning, Quantitative Techniques)
  - Creates a complete test with all questions

### 2. Continue Draft Test with AI

- **Location**: Draft tests → "AI" button next to "Continue"
- **Functionality**:
  - Add AI-generated questions to existing draft tests using progressive processing
  - Maintains existing test settings and questions
  - Appends new questions with proper numbering
  - Real-time progress tracking

### 3. Legacy AI Test Creation

- **Location**: Available as fallback option
- **Functionality**:
  - Traditional bulk processing (may timeout on large content)
  - Suitable for smaller test content

## How It Works

### 1. Progressive AI Processing Pipeline

```
Raw Text Input → Structure Analysis → Section-by-Section Processing → Real-time Progress → Database Storage
```

1. **Input**: Raw text from PDF/Word documents
2. **Structure Analysis**: AI first analyzes the content to determine sections and question counts
3. **Progressive Processing**: Questions are processed section by section to avoid timeouts
4. **Real-time Updates**: Progress is tracked and displayed to the user
5. **Database Storage**: Questions are saved incrementally as they're processed
6. **Resumption**: Processing can be resumed if interrupted

### 2. Legacy AI Processing Pipeline

```
Raw Text Input → Gemini AI Processing → Structured JSON → Database Storage
```

1. **Input**: Raw text from PDF/Word documents
2. **AI Processing**: Gemini AI analyzes and structures the content
3. **Validation**: System validates and cleans the AI output
4. **Storage**: Questions are stored in the database with proper relationships

### 3. AI Prompt Engineering

The system uses a sophisticated prompt that instructs Gemini AI to:

- Extract only useful test information (passages, questions, options, correct answers)
- Organize content by CLAT sections
- Generate explanations for missing ones
- Infer correct answers when not provided
- Maintain proper question numbering across sections
- Clean and format broken/noisy text

### 3. Data Structure

The AI processes content into this structure:

```json
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
```

## Setup Instructions

### 1. Environment Configuration

Add the Gemini API key to your `.env.local` file:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 2. Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your environment variables

### 3. API Endpoints

The feature uses several API endpoints:

**Progressive Processing (Recommended):**

- **`/api/admin/tests/ai-process-progressive`**: Handles progressive AI processing with real-time updates
  - `POST` with `action: 'start'` - Start new processing
  - `POST` with `action: 'status'` - Get processing status
  - `POST` with `action: 'cancel'` - Cancel processing

**Legacy Processing:**

- **`/api/admin/tests/ai-process`**: Processes raw text with AI (bulk processing)
- **`/api/admin/tests/[id]/questions/ai-bulk`**: Creates questions in bulk

## Usage Guide

### Creating a New Test with Progressive AI

1. **Navigate** to Admin Dashboard → Test Management
2. **Click** "Create with AI" button (purple gradient button)
3. **Fill** in basic test information (optional for new tests):
   - Test Title (AI will generate if empty)
   - Key Topic
   - Test Type (Free/Paid)
   - Duration
4. **Paste** your raw test content in the text area
5. **Click** "Start Progressive Processing" button
6. **Monitor** real-time progress in the right panel:
   - Progress bar showing completion percentage
   - Questions processed counter
   - Current section being processed
   - Live updates every 2 seconds
7. **Wait** for completion or **Cancel** if needed
8. **Automatic redirect** to questions page when complete

### Continuing a Draft Test with Progressive AI

1. **Find** your draft test in the test list
2. **Click** the "AI" button next to "Continue"
3. **Paste** additional test content
4. **Start** progressive processing
5. **Monitor** real-time progress
6. **Questions are automatically added** to your existing test

## Best Practices

### Input Text Formatting

For best results, ensure your input text:

- Contains clear question numbers (Q1, Q2, etc.)
- Has properly formatted options (A), B), C), D))
- Includes passages before related questions
- Has correct answers marked (Answer: B, Correct: C, etc.)

### Content Organization

The AI works best with content that:

- Is organized by sections
- Has clear question-answer pairs
- Contains minimal formatting noise
- Includes passages for comprehension questions

### Quality Control

After AI processing:

- Review all generated questions
- Check correct answers and explanations
- Verify question numbering
- Ensure proper section categorization

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**

   - Ensure `GEMINI_API_KEY` is set in your environment variables
   - Restart your development server after adding the key

2. **"Failed to process with AI"**

   - Check your internet connection
   - Verify the API key is valid
   - Ensure the input text is not empty

3. **"Invalid AI response format"**

   - The AI might have generated malformed JSON
   - Try processing smaller chunks of text
   - Check the raw response in browser developer tools

4. **"No valid questions to create"**
   - The AI might not have found any questions in the input
   - Ensure your text contains clear question formats
   - Try reformatting your input text

### Performance Tips

- **Chunk Large Documents**: For very large documents, process in smaller sections
- **Clean Input**: Remove unnecessary formatting and noise before processing
- **Review Results**: Always review AI-generated content before finalizing

## Technical Details

### AI Model Used

- **Model**: Gemini 2.0 Flash
- **Temperature**: 0.1 (for consistent output)
- **Max Tokens**: 8192
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

### Database Integration

- Questions are stored with proper relationships to tests
- Question numbering is automatically managed
- Section types are validated against the schema
- All questions include proper metadata (marks, timing, etc.)

### Security

- API endpoints require admin authentication
- Gemini API key is server-side only
- Input validation prevents malicious content
- Rate limiting prevents API abuse

## Future Enhancements

Potential improvements for the AI test creation feature:

- Support for image-based questions
- Batch processing of multiple documents
- Custom AI prompts for different question types
- Integration with document upload (PDF parsing)
- Question difficulty analysis
- Automatic answer key generation

## Support

For issues or questions about the AI test creation feature:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify your environment configuration
4. Test with smaller, simpler content first

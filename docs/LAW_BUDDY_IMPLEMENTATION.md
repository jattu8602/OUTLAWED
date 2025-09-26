# Law Buddy - AI Chat Assistant Implementation

## Overview

Law Buddy is an AI-powered chat assistant designed specifically for law students preparing for CLAT. It provides personalized study assistance, test-specific guidance, and comprehensive legal concept explanations.

## Features

### 🤖 AI Chat Support

- **Real-time Chat**: Students can directly chat with AI to solve doubts and get explanations
- **Contextual Responses**: AI provides accurate legal explanations tailored to CLAT preparation
- **Study Tips**: Offers study strategies and test-taking tips
- **Legal Concepts**: Explains complex legal reasoning in simple terms

### 📚 Reference Test Mode

- **Test Selection**: Students can select any test they have attempted
- **Performance Context**: AI gets access to student's test history including:
  - Attempted answers and reattempts
  - Performance scores and statistics
  - Wrong answers and weak areas
  - Time taken per question
- **Personalized Guidance**: AI provides targeted advice based on actual performance

### 💬 Chat History & Management

- **Auto-saved Chats**: Every conversation is automatically saved
- **Smart Titles**: System generates meaningful titles for each chat
- **Easy Navigation**: Students can revisit past conversations anytime
- **Test Context**: Each chat remembers which test was referenced

### 📱 Mobile Responsive Design

- **Sticky Layout**: Single-page design with sticky positioning
- **Collapsible Sidebar**: Chat history sidebar that collapses on mobile
- **Touch-friendly**: Optimized for mobile interactions
- **Responsive Grid**: Test selector adapts to screen size

## Technical Implementation

### Database Schema

```prisma
model LawBuddyChat {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  userId          String   @db.ObjectId
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title           String
  messages        Json     // Array of message objects with role, content, timestamp
  referenceTestId String?  @db.ObjectId
  referenceTest   Test?    @relation(fields: [referenceTestId], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

### API Endpoints

#### `/api/law-buddy/chat` (POST)

- **Purpose**: Send messages to AI and get responses
- **Authentication**: Required (NextAuth session)
- **Request Body**:
  ```json
  {
    "message": "string",
    "chatId": "string (optional)",
    "referenceTestId": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "response": "string",
    "chatId": "string"
  }
  ```

#### `/api/law-buddy/history` (GET)

- **Purpose**: Fetch user's chat history
- **Authentication**: Required (NextAuth session)
- **Response**:
  ```json
  {
    "chats": [
      {
        "id": "string",
        "title": "string",
        "referenceTest": { "id": "string", "title": "string" },
        "messageCount": "number",
        "updatedAt": "datetime",
        "createdAt": "datetime"
      }
    ]
  }
  ```

#### `/api/user/tests` (GET)

- **Purpose**: Fetch user's test attempts for reference selection
- **Authentication**: Required (NextAuth session)
- **Response**:
  ```json
  {
    "tests": [
      {
        "id": "string",
        "title": "string",
        "type": "FREE|PAID",
        "score": "number",
        "percentage": "number",
        "completedAt": "datetime"
      }
    ]
  }
  ```

### OpenAI Integration

- **Model**: GPT-4o-mini for cost-effective responses
- **System Prompt**: Specialized for law students and CLAT preparation
- **Context Injection**: Test performance data is included when reference test is selected
- **Response Optimization**: Balanced between comprehensive and concise

### UI Components

#### Main Features

1. **Chat Interface**: Real-time messaging with typing indicators
2. **History Sidebar**: Collapsible chat history with test context
3. **Test Selector**: Grid of user's completed tests for reference
4. **Quick Start Prompts**: Pre-defined questions for easy interaction
5. **Mobile Navigation**: Hamburger menu for mobile devices

#### Design Elements

- **Gradient Backgrounds**: Blue to purple gradients for modern look
- **Smooth Animations**: Transition effects for better UX
- **Loading States**: Typing indicators and loading spinners
- **Responsive Grid**: Adaptive layout for different screen sizes

## Usage Flow

### 1. Initial Access

- User navigates to `/dashboard/law-buddy`
- System loads user's test history and chat history
- Welcome screen with quick start prompts

### 2. Test Reference Selection

- User can select a completed test for personalized assistance
- Test context is passed to AI for targeted responses
- Reference test badge shows current selection

### 3. Chat Interaction

- User types questions or uses quick start prompts
- AI responds with contextual legal guidance
- Messages are auto-saved with timestamps

### 4. Chat Management

- New chat button starts fresh conversation
- History sidebar shows all past conversations
- Each chat remembers its reference test context

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```

### Prisma Setup

```bash
# Apply schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Security Features

- **Authentication**: All endpoints require valid NextAuth session
- **User Isolation**: Users can only access their own chats and tests
- **Input Validation**: Message content is validated before processing
- **Rate Limiting**: Built-in protection against API abuse

## Performance Optimizations

- **Lazy Loading**: Chat history loads on demand
- **Efficient Queries**: Optimized database queries with proper indexing
- **Caching**: Chat history is cached in client state
- **Debounced Input**: Prevents excessive API calls

## Future Enhancements

- **Voice Input**: Speech-to-text for hands-free interaction
- **File Uploads**: Support for document analysis
- **Advanced Analytics**: Chat usage statistics and insights
- **Multi-language**: Support for regional languages
- **Integration**: Connect with other study tools and resources

## Troubleshooting

### Common Issues

1. **Chat not loading**: Check authentication and database connection
2. **AI not responding**: Verify OpenAI API key and quota
3. **Test context missing**: Ensure user has completed tests
4. **Mobile layout issues**: Check responsive breakpoints

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Confirm database schema is up to date
4. Test OpenAI API key validity

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.

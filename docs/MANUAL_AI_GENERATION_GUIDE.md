# Manual AI Test Generation Guide

## 🎯 Overview

The Manual AI Test Generation feature allows you to **control the pace** of question generation by processing **one passage at a time**. This gives you full control over the generation process and lets you review each passage's questions before proceeding to the next.

## ✨ Key Features

### 🔄 **Manual Control**

- **Click "Generate Next"** to process one passage at a time
- **Review results** before proceeding to the next passage
- **Full control** over the generation pace
- **No timeouts** - process at your own speed

### 👁️ **Real-time Preview**

- **Side panel** shows generated questions immediately
- **Current passage info** displayed with content preview
- **Progress tracking** with visual indicators
- **Question preview** with options and correct answers

### 📊 **Progress Tracking**

- **Visual progress bar** showing completion status
- **Question counter** - total questions generated
- **Passage counter** - current passage / total passages
- **Real-time updates** as you generate

## 🚀 How to Use

### 1. **Start Manual Processing**

1. Go to **Admin Dashboard** → `/admin/create-test`
2. Click **"Create with AI"** (purple button)
3. Fill in test information (title, topic, type, duration)
4. **Paste your test content** in the "Raw Test Data" field
5. Click **"Start Manual Processing"**

### 2. **Generate Passages One by One**

1. The system will **analyze your content** and identify passages
2. Click **"Generate Next Passage"** to process the first passage
3. **Review the generated questions** in the side panel
4. Click **"Generate Next Passage"** again for the next passage
5. **Repeat** until all passages are processed

### 3. **Review and Complete**

- **Check each passage's questions** before proceeding
- **See the current passage content** and section type
- **Monitor progress** with the progress bar
- **Complete when done** - you'll be redirected to the questions page

## 🎨 Interface Layout

### **Left Panel - Controls**

- **Test Information Form** (for new tests)
- **Raw Text Input** (paste your content here)
- **Manual Generation Controls**
  - Start Manual Processing button
  - Generate Next Passage button
  - Cancel Processing button

### **Right Panel - Results**

- **Processing Progress Card**
  - Progress bar
  - Question counter
  - Passage counter
- **Current Passage Info**
  - Passage title and content preview
  - Section type
  - Questions generated count
- **Generated Questions Preview**
  - Latest questions from current passage
  - Question text, options, and correct answer
  - Scrollable list for multiple questions

## 🔧 Technical Details

### **API Endpoint**

- **Route**: `/api/admin/tests/ai-process-manual`
- **Actions**: `start`, `generate-next`, `status`, `cancel`
- **State Management**: In-memory processing states
- **Error Handling**: Robust JSON parsing with fallbacks

### **Processing Flow**

1. **Initialize**: Analyze content and identify passages
2. **Generate**: Process one passage at a time
3. **Save**: Store questions in database immediately
4. **Preview**: Show results in real-time
5. **Continue**: Manual progression to next passage

### **Data Structure**

```json
{
  "processingId": "manual_1234567890_abc123",
  "status": "ready|processing|completed|error",
  "testId": "test_id_here",
  "testTitle": "Generated Test",
  "passages": [
    {
      "index": 0,
      "title": "Passage 1",
      "sectionType": "ENGLISH",
      "startText": "First few words..."
    }
  ],
  "currentPassageIndex": 0,
  "generatedQuestions": [],
  "totalQuestions": 0
}
```

## 🎯 Benefits

### **For Users**

- ✅ **Full control** over generation pace
- ✅ **Review before proceeding** - no surprises
- ✅ **No timeouts** - process large files without issues
- ✅ **Real-time feedback** - see results immediately
- ✅ **Error recovery** - can retry individual passages

### **For System**

- ✅ **No server timeouts** - manual progression
- ✅ **Better error handling** - per-passage processing
- ✅ **Memory efficient** - process in chunks
- ✅ **User-friendly** - clear progress indication
- ✅ **Resumable** - can continue from any point

## 🚨 Error Handling

### **Common Issues**

- **JSON Parsing Errors**: Automatically handled with fallbacks
- **API Timeouts**: Not applicable with manual processing
- **Large Files**: Processed in manageable chunks
- **Network Issues**: Can retry individual passages

### **Recovery Options**

- **Retry Generation**: Click "Generate Next" again
- **Cancel and Restart**: Use cancel button to start over
- **Continue Later**: Processing state is maintained

## 📝 Example Workflow

1. **Paste Content**: Copy your 225KB test.txt content
2. **Start Processing**: Click "Start Manual Processing"
3. **System Analysis**: Identifies 5 passages automatically
4. **Generate Passage 1**: Click "Generate Next" → See 3 questions
5. **Review Questions**: Check quality in side panel
6. **Generate Passage 2**: Click "Generate Next" → See 4 questions
7. **Continue**: Repeat for remaining passages
8. **Complete**: All passages processed → Redirect to questions page

## 🎉 Ready to Use!

The Manual AI Test Generation feature is now **production-ready** and provides the exact control you requested:

- ✅ **Manual button clicks** for each passage
- ✅ **Real-time side panel** showing generated questions
- ✅ **Full control** over generation pace
- ✅ **No timeouts** or automatic processing
- ✅ **Professional UI** with progress tracking

**Start testing with your `test.txt` content now!** 🚀

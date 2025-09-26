# Rich Text Editor Implementation Guide

## Overview

This document outlines the implementation of rich text editing functionality for comprehension and explanation fields in the CLAT prep platform.

## Features Implemented

### 1. Rich Text Editor Component (`components/ui/rich-text-editor.jsx`)

#### Available Formatting Options:

- **Bold Text**: Make text bold for emphasis
- **Bullet Lists**: Create organized bullet point lists
- **Line Breaks**: Add line breaks for better formatting

#### Technical Implementation:

- Built with **TipTap** editor framework
- Supports HTML and JSON output formats
- Responsive design with dark mode support
- Real-time formatting with visual feedback

### 2. Help Popup Component (`components/ui/rich-text-editor-help.jsx`)

#### Features:

- **Interactive Guide**: Step-by-step instructions for each feature
- **Best Practices**: Tips for creating effective explanations
- **Example Usage**: Real-world examples of formatted content
- **Keyboard Shortcuts**: Quick reference for power users

#### Content Sections:

1. **Overview**: General information about the editor
2. **Available Features**: Detailed explanation of each formatting option
3. **Best Practices**: Tips for creating clear, structured content
4. **Example**: Sample formatted explanation for reference

## Database Schema Updates

### Question Model Enhancements:

```prisma
model Question {
  // ... existing fields ...

  // Comprehension fields
  isComprehension Boolean        @default(false)
  comprehension   String?
  comprehensionFormat Json?      // Store formatting data for comprehension text

  // Explanation fields
  explanation     String?
  explanationFormat Json?        // Store formatting data for explanation text

  // ... other fields ...
}
```

### Data Structure:

- **HTML Format**: Stored in `comprehension` and `explanation` fields
- **JSON Format**: Stored in `comprehensionFormat` and `explanationFormat` fields
- **Backward Compatibility**: Existing plain text remains functional

## Usage Examples

### 1. Comprehension Text Example:

```html
<p><strong>Passage:</strong></p>
<p>
  Article 14 of the Indian Constitution guarantees equality before law and equal
  protection of laws to all persons within the territory of India.
</p>
<p><strong>Key Points:</strong></p>
<ul>
  <li>Applies to all citizens equally</li>
  <li>Cannot be suspended except during emergency</li>
  <li>Enforceable in courts of law</li>
</ul>
```

### 2. Explanation Text Example:

```html
<p><strong>Correct Answer:</strong> Option B</p>
<p><strong>Explanation:</strong></p>
<p>The question tests your understanding of constitutional law principles.</p>
<ul>
  <li>Article 14 guarantees <strong>equality before law</strong></li>
  <li>This principle applies to <strong>all citizens equally</strong></li>
  <li>Fundamental rights are <strong>enforceable in courts</strong></li>
</ul>
<p>
  <strong>Key Takeaway:</strong> Article 14 is a cornerstone of Indian
  democracy.
</p>
```

## Implementation Details

### 1. Component Integration:

```jsx
// Import the components
import RichTextEditor from '@/components/ui/rich-text-editor'
import RichTextEditorHelp from '@/components/ui/rich-text-editor-help'

// Usage in form
;<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label>Explanation</Label>
    <RichTextEditorHelp />
  </div>
  <RichTextEditor
    value={questionData.explanation}
    onChange={(value) => handleInputChange('explanation', value)}
  />
</div>
```

### 2. Data Handling:

```jsx
const handleInputChange = (field, value) => {
  if (field === 'explanation') {
    setQuestionData((prev) => ({
      ...prev,
      explanation: value.html, // HTML for display
      explanationFormat: value.json, // JSON for editing
    }))
    return
  }
  // ... other fields
}
```

### 3. Display in Student Interface:

```jsx
// Render formatted content
<div
  className="prose dark:prose-invert"
  dangerouslySetInnerHTML={{
    __html: question.explanation,
  }}
/>
```

## Best Practices

### 1. Content Structure:

- **Use Headers**: Organize content with clear headings
- **Bullet Points**: Break down complex explanations into digestible points
- **Bold Emphasis**: Highlight key concepts and important terms
- **Logical Flow**: Present information in a logical sequence

### 2. Formatting Guidelines:

- **Keep it Concise**: Avoid overly long explanations
- **Use Consistent Formatting**: Maintain uniform styling throughout
- **Prioritize Readability**: Ensure content is easy to scan and understand
- **Mobile-Friendly**: Consider how content appears on smaller screens

### 3. Educational Value:

- **Step-by-Step Logic**: Explain the reasoning process clearly
- **Key Concepts**: Emphasize fundamental principles
- **Common Mistakes**: Address typical student misconceptions
- **Real-World Context**: Connect concepts to practical applications

## Technical Considerations

### 1. Performance:

- **Lazy Loading**: Rich text editor loads only when needed
- **Optimized Bundles**: Minimal impact on page load times
- **Efficient Updates**: Real-time formatting without performance degradation

### 2. Accessibility:

- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader Compatible**: Proper ARIA labels and semantic HTML
- **High Contrast Support**: Works well with accessibility tools

### 3. Security:

- **HTML Sanitization**: Prevents XSS attacks
- **Content Validation**: Ensures safe content storage
- **Input Filtering**: Removes potentially harmful elements

## Migration Guide

### For Existing Content:

1. **Plain Text**: Existing plain text explanations remain functional
2. **Gradual Migration**: Can be updated to rich text format over time
3. **Backward Compatibility**: Old format continues to work seamlessly

### Database Migration:

```bash
# Generate migration
npx prisma migrate dev --name add_explanation_format

# Apply migration
npx prisma migrate deploy
```

## Future Enhancements

### 1. Additional Formatting Options:

- **Italic Text**: For emphasis and foreign terms
- **Numbered Lists**: For step-by-step instructions
- **Code Blocks**: For legal citations and references
- **Links**: For external references and resources

### 2. Advanced Features:

- **Image Support**: Embed diagrams and charts
- **Table Support**: Create structured data tables
- **Math Equations**: Support for mathematical notation
- **Citations**: Automatic legal citation formatting

### 3. User Experience:

- **Auto-save**: Prevent content loss during editing
- **Version History**: Track changes and allow rollbacks
- **Collaborative Editing**: Multiple admin support
- **Template Library**: Pre-built explanation templates

## Troubleshooting

### Common Issues:

1. **Editor Not Loading**: Check if all dependencies are installed
2. **Formatting Not Saving**: Verify data handling in form submission
3. **Display Issues**: Ensure proper CSS classes are applied
4. **Performance Problems**: Consider lazy loading for large forms

### Debug Steps:

1. Check browser console for errors
2. Verify component imports and exports
3. Test with minimal content first
4. Validate HTML output format

## Conclusion

The rich text editor implementation provides a powerful yet user-friendly way to create structured, educational content. The combination of intuitive formatting tools and comprehensive help documentation ensures that admins can create high-quality explanations that enhance student learning.

The modular design allows for easy expansion and customization, while the robust data handling ensures reliable storage and retrieval of formatted content.

'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

// Custom markdown-like parser for AI responses
export function MarkdownRenderer({ content, className = '' }) {
  const parsedContent = useMemo(() => {
    if (!content) return ''

    let html = content

    // Parse headers (###, ##, #)
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">$1</h3>'
    )
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-3">$1</h2>'
    )
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4">$1</h1>'
    )

    // Parse bold text (**text** or __text__)
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>'
    )
    html = html.replace(
      /__(.*?)__/g,
      '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>'
    )

    // Parse italic text (*text* or _text_)
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-slate-700 dark:text-slate-300">$1</em>'
    )
    html = html.replace(
      /_(.*?)_/g,
      '<em class="italic text-slate-700 dark:text-slate-300">$1</em>'
    )

    // Parse code blocks (```code```)
    html = html.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-sm text-slate-800 dark:text-slate-200">$1</code></pre>'
    )

    // Parse inline code (`code`)
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    )

    // Parse question patterns (Q1:, Q2:, etc.)
    html = html.replace(
      /^### (Q\d+:.*$)/gim,
      '<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 my-4"><h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">$1</h3>'
    )

    // Parse correct answer patterns
    html = html.replace(
      /- \*\*Correct Answer:\*\* \((.*?)\)/g,
      '<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 my-2"><p class="text-sm"><span class="font-semibold text-green-800 dark:text-green-200">Correct Answer:</span> <span class="text-green-700 dark:text-green-300 font-mono">($1)</span></p></div>'
    )

    // Parse explanation patterns
    html = html.replace(
      /- \*\*Explanation:\*\* (.*?)(?=\n\n|\n-|\n###|\n---|$)/gs,
      '<div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 my-2"><p class="text-sm"><span class="font-semibold text-slate-800 dark:text-slate-200">Explanation:</span> <span class="text-slate-700 dark:text-slate-300">$1</span></p></div>'
    )

    // Parse study tips section
    html = html.replace(
      /^### Study Tips:/gim,
      '<h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100 mt-6 mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">Study Tips:</h3>'
    )

    // Parse numbered study tips (1. Active Reading:, 2. Practice Inference:, etc.)
    html = html.replace(
      /^(\d+)\. \*\*(.*?):\*\*/gim,
      '<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 my-2"><p class="text-sm"><span class="font-semibold text-amber-800 dark:text-amber-200">$1. $2:</span></p>'
    )

    // Parse general tips without numbers
    html = html.replace(
      /^(\d+)\. (.*?)(?=\n\d+\.|\n\n|\n---|$)/gims,
      '<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 my-2"><p class="text-sm text-amber-700 dark:text-amber-300">$1. $2</p></div>'
    )

    // Parse encouragement messages
    html = html.replace(
      /If you have any other questions or need further clarification on any of these points, feel free to ask! You're doing great, and with some practice, you'll improve your performance\./g,
      '<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 my-4"><p class="text-sm text-green-800 dark:text-green-200 font-medium">💪 If you have any other questions or need further clarification on any of these points, feel free to ask! You\'re doing great, and with some practice, you\'ll improve your performance.</p></div>'
    )

    // Parse unordered lists (- item or * item)
    html = html.replace(
      /^[\s]*[-*] (.*$)/gim,
      '<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">$1</li>'
    )

    // Wrap consecutive list items in ul
    html = html.replace(
      /(<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">.*<\/li>)/gs,
      (match) => {
        const items = match.match(
          /<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">.*?<\/li>/g
        )
        if (items && items.length > 0) {
          return `<ul class="list-disc list-inside space-y-1 my-3">${items.join(
            ''
          )}</ul>`
        }
        return match
      }
    )

    // Parse ordered lists (1. item, 2. item, etc.)
    html = html.replace(
      /^[\s]*\d+\. (.*$)/gim,
      '<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">$1</li>'
    )

    // Wrap consecutive numbered list items in ol
    html = html.replace(
      /(<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">.*<\/li>)/gs,
      (match) => {
        const items = match.match(
          /<li class="ml-4 mb-1 text-slate-700 dark:text-slate-300">.*?<\/li>/g
        )
        if (items && items.length > 0) {
          return `<ol class="list-decimal list-inside space-y-1 my-3">${items.join(
            ''
          )}</ol>`
        }
        return match
      }
    )

    // Parse blockquotes (> text)
    html = html.replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 text-slate-700 dark:text-slate-300 italic">$1</blockquote>'
    )

    // Parse horizontal rules (---)
    html = html.replace(
      /^---$/gim,
      '<hr class="my-4 border-slate-200 dark:border-slate-700" />'
    )

    // Parse line breaks
    html = html.replace(/\n/g, '<br />')

    // Clean up any double line breaks
    html = html.replace(/<br \/><br \/>/g, '<br />')

    return html
  }, [content])

  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(parsedContent, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'blockquote',
        'hr',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['class'],
    })
  }, [parsedContent])

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

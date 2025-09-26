import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

export const useSanitizedHTML = (rawHTML) => {
  const [sanitizedHTML, setSanitizedHTML] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSanitizedHTML(DOMPurify.sanitize(rawHTML))
    }
  }, [rawHTML])

  return sanitizedHTML
}

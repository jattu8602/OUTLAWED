'use client'

import { useEffect, useState } from 'react'
import quotesData from '@/data/clatQuotes.json' // adjust path as needed
import { motion } from 'framer-motion'

export default function MotivationQuotes() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    // Pick random quote on mount
    changeQuote()
    // Change quote every 3 seconds
    const interval = setInterval(changeQuote, 3000)
    return () => clearInterval(interval)
  }, [])

  const changeQuote = () => {
    const quotes = quotesData.quotes
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }

  return (
    <div className="w-full flex justify-center mt-6 px-4">
      <motion.div
        key={quote}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center text-base md:text-lg font-medium text-slate-700 dark:text-slate-200 max-w-2xl"
      >
        {quote}
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import quotesData from '@/data/clatQuotes.json'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    changeQuote()
    const interval = setInterval(changeQuote, 3000)
    return () => clearInterval(interval)
  }, [])

  const changeQuote = () => {
    const quotes = quotesData.quotes
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F8FA] dark:bg-[#141D30] px-4">
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="mb-6"
      >
        <Loader2 className="w-12 h-12 text-green-500" />
      </motion.div>

      {/* Motivational Quote */}
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

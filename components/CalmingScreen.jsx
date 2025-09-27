
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Feather, Wind, X } from 'lucide-react'
import { Button } from './ui/button'
import quotesData from '@/data/clatQuotes.json'

const CalmingScreen = ({ onStartTest, onCancel, testName, testDuration }) => {
  const [quote, setQuote] = useState({ text: '', author: '' })
  const [show, setShow] = useState(false)

  useEffect(() => {
    const randomQuote =
      quotesData.quotes[Math.floor(Math.random() * quotesData.quotes.length)]
    setQuote({ text: randomQuote, author: 'CLAT Prep' })
    setShow(true)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-mint-100 to-pink-100"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(200,230,201,0.5),rgba(255,255,255,0))]"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            className="relative z-10 w-full max-w-md space-y-6"
          >
            {/* Quote Widget */}
            <div className="relative rounded-2xl border border-white/20 bg-pink-50/50 p-6 shadow-lg backdrop-blur-lg">
              <div className="absolute -top-4 -left-4 rounded-full bg-white/70 p-3 shadow-md">
                <Feather className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-pink-800">
                Quote for Today
              </h3>
              <p className="text-lg italic text-pink-900">"{quote.text}"</p>
            </div>

            {/* Breathing Widget */}
            <div className="relative rounded-2xl border border-white/20 bg-white/60 p-6 text-center shadow-lg backdrop-blur-lg">
              <div className="absolute -top-4 -right-4 rounded-full bg-white/70 p-3 shadow-md">
                <Wind className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Take a Deep Breath
              </h2>
              <p className="mb-6 mt-2 text-gray-600">
                Prepare your mind for the test.
              </p>

              <div className="relative mx-auto h-32 w-32">
                <div className="absolute inset-0 animate-pulse rounded-full bg-blue-200/50"></div>
                <div className="absolute inset-2 animate-pulse rounded-full bg-blue-200/50 [animation-delay:0.5s]"></div>
                <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
                  <span className="text-sm font-semibold text-blue-800">
                    Breathe
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={onCancel}
                variant="outline"
                className="rounded-full border-2 border-gray-300 bg-transparent px-8 py-3 text-gray-700 backdrop-blur-sm transition-all hover:bg-white/50 hover:text-gray-900"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button
                onClick={onStartTest}
                className="group relative rounded-full bg-green-500 px-8 py-3 text-white shadow-lg transition-all hover:bg-green-600"
              >
                Start Test
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CalmingScreen

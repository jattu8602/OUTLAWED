'use client'

import { motion } from 'framer-motion'
import { Clock, BookOpen, RotateCcw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const StudyCard = ({
  day,
  date,
  testName,
  duration,
  badgeLabel,
  badgeGradient,
  focusText,
  isToday = false,
  isCompleted = false,
  isAttempted = false,
  onTestAction,
  sections = [],
  reason = '',
}) => {
  const getSectionIcon = (section) => {
    const icons = {
      ENGLISH: '📚',
      GK_CA: '🌍',
      LEGAL_REASONING: '⚖️',
      LOGICAL_REASONING: '🧠',
      QUANTITATIVE_TECHNIQUES: '🔢',
    }
    return icons[section] || '📖'
  }

  const getSectionColor = (section) => {
    const colors = {
      ENGLISH: 'bg-blue-100 text-blue-800 border-blue-200',
      GK_CA: 'bg-green-100 text-green-800 border-green-200',
      LEGAL_REASONING: 'bg-purple-100 text-purple-800 border-purple-200',
      LOGICAL_REASONING: 'bg-orange-100 text-orange-800 border-orange-200',
      QUANTITATIVE_TECHNIQUES: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[section] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group relative overflow-hidden rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/60 transition-all duration-300"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 group-hover:bg-[url('/icons/cardbg2.jpg')]"
        style={{
          backgroundImage: 'url(/icons/cardbg.jpg)',
        }}
      />
      
      {/* Shiny border effect */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm group-hover:bg-white/70 transition-all duration-300" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{day}</p>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          {isToday && (
            <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Today
            </Badge>
          )}
        </div>

        {/* Test Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {testName === 'No test available' ? (
            <span className="text-gray-500 italic">No test available</span>
          ) : (
            testName
          )}
        </h3>

        {/* Info Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {duration} min
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${badgeGradient}`}>
            {badgeLabel}
          </div>
        </div>

        {/* Sections */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {sections.slice(0, 2).map((section) => (
              <Badge
                key={section}
                variant="secondary"
                className={`text-xs ${getSectionColor(section)}`}
              >
                {getSectionIcon(section)} {section.replace('_', ' ')}
              </Badge>
            ))}
            {sections.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{sections.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Focus Text */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">
            <strong>Focus:</strong> {focusText}
          </p>
          {reason && (
            <p className="text-xs text-gray-500">{reason}</p>
          )}
        </div>

        {/* Action Button */}
        {testName !== 'No test available' && (
          <div className="pt-2">
            {isCompleted ? (
              <div className="flex items-center justify-center text-sm text-green-600 font-semibold p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </div>
            ) : isAttempted ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => onTestAction('reattempt')}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-attempt
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => onTestAction('attempt')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Test
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StudyCard

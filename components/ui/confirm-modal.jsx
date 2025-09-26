'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning', 'info', 'success'
  confirmButtonVariant = 'default', // 'default', 'danger', 'warning', 'info', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  showIcon = true,
  loading = false,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const handleConfirm = () => {
    onConfirm()
    // onClose()
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  // Icon configuration
  const getIcon = () => {
    if (!showIcon) return null

    const iconClasses = 'w-6 h-6'
    switch (type) {
      case 'danger':
        return <AlertCircle className={`${iconClasses} text-red-500`} />
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClasses} text-blue-500`} />
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-500`} />
      default:
        return <AlertTriangle className={`${iconClasses} text-gray-500`} />
    }
  }

  // Button variant styles
  const getButtonStyles = (variant) => {
    const baseStyles =
      'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    switch (variant) {
      case 'danger':
        return `${baseStyles} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`
      case 'warning':
        return `${baseStyles} bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500`
      case 'info':
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`
      case 'success':
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`
      default:
        return `${baseStyles} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`
    }
  }

  // Size configurations
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'lg':
        return 'max-w-2xl'
      default:
        return 'max-w-lg'
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-200`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full ${getSizeClasses()} transform transition-all duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          {children || (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={getButtonStyles(confirmButtonVariant)}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

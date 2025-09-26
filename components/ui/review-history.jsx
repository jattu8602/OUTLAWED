'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default function ReviewHistory({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your submitted reviews will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5" />
          <span>Your Reviews</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            {/* Review Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    review.rating >= 4
                      ? 'border-green-500 text-green-700 dark:text-green-400'
                      : review.rating >= 3
                      ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                      : 'border-red-500 text-red-700 dark:text-red-400'
                  }`}
                >
                  {review.rating === 1 && 'Poor'}
                  {review.rating === 2 && 'Fair'}
                  {review.rating === 3 && 'Good'}
                  {review.rating === 4 && 'Very Good'}
                  {review.rating === 5 && 'Excellent'}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Review Description */}
            {review.description && (
              <div className="mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {review.description}
                </p>
              </div>
            )}

            {/* Admin Reply */}
            {review.adminReply && (
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Admin Response
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {new Date(review.repliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {review.adminReply}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

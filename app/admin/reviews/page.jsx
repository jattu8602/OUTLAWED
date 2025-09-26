'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Star,
  MessageSquare,
  Clock,
  User,
  Reply,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (review) => {
    setSelectedReview(review)
    setReplyText('')
    setIsReplyDialogOpen(true)
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    setIsSubmittingReply(true)
    try {
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminReply: replyText }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Reply sent successfully!')
        setIsReplyDialogOpen(false)
        setReplyText('')
        fetchReviews() // Refresh reviews
      } else {
        toast.error(result.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const markAsRead = async (reviewId) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        fetchReviews() // Refresh reviews
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4)
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    if (rating >= 3)
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
  }

  const getRatingText = (rating) => {
    if (rating === 1) return 'Poor'
    if (rating === 2) return 'Fair'
    if (rating === 3) return 'Good'
    if (rating === 4) return 'Very Good'
    if (rating === 5) return 'Excellent'
    return 'Unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Reviews
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and respond to user feedback
            </p>
          </div>
          <Button
            onClick={fetchReviews}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                User reviews will appear here when submitted
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className={`bg-white dark:bg-gray-900 border shadow-md transition-all duration-200 ${
                  !review.isRead
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.image} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {review.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.user.name || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!review.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getRatingColor(review.rating)}`}
                      >
                        {getRatingText(review.rating)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating */}
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
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Description */}
                  {review.description && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.description}
                      </p>
                    </div>
                  )}

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Admin Response
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {new Date(review.repliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {review.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(review.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!review.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(review.id)}
                          className="text-xs"
                        >
                          Mark as Read
                        </Button>
                      )}
                      {!review.adminReply && (
                        <Button
                          size="sm"
                          onClick={() => handleReply(review)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                Reply to Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReview && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedReview.user.image} />
                      <AvatarFallback className="text-xs">
                        {selectedReview.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedReview.user.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= selectedReview.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {selectedReview.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "{selectedReview.description}"
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Reply
                </label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to the user..."
                  className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReplyDialogOpen(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReply}
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

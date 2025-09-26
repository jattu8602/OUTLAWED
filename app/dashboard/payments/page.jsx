'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Loader2, Crown, Calendar, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PlanCard from '@/components/payments/PlanCard'

const SubscriptionStatus = ({ userStatus }) => {
  if (!userStatus || !userStatus.isCurrentlyPaid) {
    return null
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="mr-2 text-yellow-500" />
          You are a Pro Member!
        </CardTitle>
        <CardDescription>
          Your current plan is active. You can extend your subscription by
          purchasing another plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-lg">
          <Calendar className="mr-2 h-5 w-5" />
          <span>
            Your access is valid until:{' '}
            <strong>{formatDateTime(userStatus.paidUntil)}</strong>
          </span>
        </div>
        {userStatus.currentPlan && (
          <p className="text-sm text-muted-foreground mt-2">
            Current Plan: {userStatus.currentPlan.name}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function PaymentsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [userStatus, setUserStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(null) // To show loading on a specific plan card

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchData()
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [sessionStatus, router])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statusRes, plansRes] = await Promise.all([
        fetch('/api/user/status'),
        fetch('/api/payment-plans'),
      ])

      if (!statusRes.ok) {
        throw new Error('Failed to fetch user status')
      }

      if (!plansRes.ok) {
        console.warn(
          'Failed to fetch payment plans, but continuing with user status'
        )
        const statusData = await statusRes.json()
        setUserStatus(statusData.user)
        setPlans([]) // Set empty plans array if fetch fails
        return
      }

      const statusData = await statusRes.json()
      const plansData = await plansRes.json()

      setUserStatus(statusData.user)
      setPlans(plansData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handlePurchase = async (plan, finalPrice) => {
    setLoadingPlan(plan.id)
    setError(null)

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res) {
      setError(
        'Failed to load payment gateway. Please check your internet connection and try again.'
      )
      setLoadingPlan(null)
      return
    }

    try {
      // 1. Create Order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: finalPrice }),
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json()
        throw new Error(errorData.error || 'Failed to create payment order.')
      }
      const orderData = await orderRes.json()

      // 2. Get Razorpay Key
      const keyRes = await fetch('/api/payments/razorpay-key')
      const keyData = await keyRes.json()
      const razorpayKey = keyData.key

      // 3. Open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'ClatPrep',
        description: `Payment for ${plan.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 4. Verify Payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              }),
            })

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json()
              throw new Error(errorData.error || 'Payment verification failed.')
            }

            // Refresh data to show new status
            await fetchData()
            // Optionally, show a success message/modal
          } catch (verifyError) {
            setError(`Payment verification failed: ${verifyError.message}`)
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

      rzp.on('payment.failed', function (response) {
        setError(
          `Payment failed: ${response.error.description} (code: ${response.error.code})`
        )
        setLoadingPlan(null)
      })
    } catch (e) {
      setError(e.message)
      setLoadingPlan(null)
    }
  }

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">
        Subscription Plans
      </h1>
      <p className="text-muted-foreground mb-8 dark:text-white">
        {userStatus?.isCurrentlyPaid
          ? 'Extend your subscription or view other available plans.'
          : 'Choose a plan to unlock premium features and get ahead of the competition.'}
      </p>

      {error && (
        <div
          className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-400 dark:text-red-200"
          role="alert"
        >
          <strong className="font-bold">
            <AlertTriangle className="inline-block mr-2" />
            Error:{' '}
          </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <SubscriptionStatus userStatus={userStatus} />

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPurchase={handlePurchase}
              loadingPlan={loadingPlan}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Plans Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No subscription plans are currently available. Please check back
              later or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

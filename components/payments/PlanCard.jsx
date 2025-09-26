'use client'
import {
  TrendingUp,
  Crown,
  Star,
  Zap,
  Clock,
  DollarSign,
  Percent,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PlanCard = ({ plan, onPurchase, loadingPlan }) => {
  const getPlanIcon = (plan) => {
    if (plan.name.toLowerCase().includes('premium')) return Crown
    if (plan.name.toLowerCase().includes('basic')) return Star
    if (plan.name.toLowerCase().includes('pro')) return Zap
    return TrendingUp
  }

  const getPlanColor = (plan) => {
    if (plan.name.toLowerCase().includes('premium'))
      return 'from-purple-500 to-pink-500'
    if (plan.name.toLowerCase().includes('basic'))
      return 'from-blue-500 to-cyan-500'
    if (plan.name.toLowerCase().includes('pro'))
      return 'from-orange-500 to-red-500'
    return 'from-green-500 to-emerald-500'
  }

  const formatDuration = (plan) => {
    if (plan.durationType === 'until_date' && plan.untilDate) {
      return `Until ${new Date(plan.untilDate).toLocaleDateString()}`
    }
    return `${plan.duration} ${plan.durationType}`
  }

  const calculateFinalPrice = () => {
    if (plan.discount && plan.discount > 0) {
      return (plan.price - (plan.price * plan.discount) / 100).toFixed(2)
    }
    return plan.price.toFixed(2)
  }
  const finalPrice = calculateFinalPrice()

  const Icon = getPlanIcon(plan)
  const gradientClass = getPlanColor(plan)

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 flex flex-col">
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${gradientClass} text-white`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                {plan.name}
              </CardTitle>
              {plan.discount > 0 && (
                <Badge variant="destructive" className="mt-1 dark:text-white">
                  {plan.discount}% OFF
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Duration:
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDuration(plan)}
            </span>
          </div>

          {plan.discount && plan.discount > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Original Price:
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white line-through">
                ₹{plan.price.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {plan.discount > 0 ? 'Discounted Price:' : 'Price:'}
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{finalPrice}
            </span>
          </div>
        </div>

        {plan.description && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {plan.description}
            </p>
          </div>
        )}
      </CardContent>

      <div className="p-6 pt-2">
        <Button
          onClick={() => onPurchase(plan, finalPrice)}
          disabled={loadingPlan === plan.id}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loadingPlan === plan.id ? 'Processing...' : 'Purchase Plan'}
        </Button>
      </div>
    </Card>
  )
}

export default PlanCard

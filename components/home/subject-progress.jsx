import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowRight } from 'lucide-react'

export function SubjectProgress() {
  return (
    <Card className="p-6 border max-w-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Subject Progress so far
      </h3>

      <div className="space-y-6">
        <div className="flex items-baseline space-x-6">
          <div className="text-5xl font-bold text-gray-900">87%</div>
          <div className="text-sm text-gray-600">
            <div className="font-medium">3m 10d</div>
            <div className="font-medium">to CLAT</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: '87%' }}
          ></div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-green-500 font-semibold">32%</span>
          <span className="text-gray-600">Over the last 30 days</span>
        </div>

        <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 font-medium">
          View Overall
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

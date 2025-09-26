import { Card } from '@/components/ui/card'

export function ActivityMetrics() {
  return (
    <Card className="p-6 border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Flashcards learnt
            </p>
            <p className="text-3xl font-bold text-gray-900">532</p>
          </div>
          <div className="flex items-end space-x-1">
            {[16, 20, 24, 28, 32].map((height, index) => (
              <div
                key={index}
                className="w-3 bg-green-400 rounded-sm"
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Videos viewed</p>
            <p className="text-3xl font-bold text-gray-900">134</p>
          </div>
          <div className="flex items-end space-x-1">
            {[12, 16, 20, 28, 24, 20].map((height, index) => (
              <div
                key={index}
                className="w-3 bg-orange-400 rounded-sm"
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

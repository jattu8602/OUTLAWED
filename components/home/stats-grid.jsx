import { Card } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 border">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-700" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Ques. Attempted</p>
            <p className="text-2xl font-bold text-gray-900">231</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Correct Answers</p>
            <p className="text-2xl font-bold text-gray-900">189</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-gray-700" />
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Avg. time / Ques.
            </p>
            <p className="text-2xl font-bold text-gray-900">01m3s</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border">
        <div className="flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Incorrect Answers
            </p>
            <p className="text-2xl font-bold text-gray-900">23</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 col-span-2 border">
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1f2937"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${73 * 2.51} ${100 * 2.51}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">73%</span>
              <span className="text-sm text-gray-600 font-medium">
                Accuracy
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

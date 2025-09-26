import { Card } from "@/components/ui/card"
import { RefreshCw, Star } from "lucide-react"

export function ProfileSection() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-medium">Profile</h2>
        <RefreshCw className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full p-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="200 283"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-2 rounded-full bg-white p-1">
              <img
                src="/smiling-man-with-beard-in-black-shirt.jpg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">Kabir Jaiswal</h3>
          <p className="text-gray-600">Aspirant</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg border">
          <div className="text-lg font-semibold text-gray-900">11</div>
          <div className="text-xs text-gray-600">Learn Videos</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border">
          <div className="text-lg font-semibold text-gray-900">56</div>
          <div className="text-xs text-gray-600">Tests Attempted</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border">
          <div className="text-lg font-semibold text-gray-900">12</div>
          <div className="text-xs text-gray-600">Trophies Earned</div>
        </div>
      </div>
    </Card>
  )
}

import { Card } from '@/components/ui/card'

export function LearningCategories() {
  const categories = [
    { name: 'Legal Reasoning', percentage: 55 },
    { name: 'General Knowledge', percentage: 67 },
    { name: 'Logical Reasoning', percentage: 80 },
    { name: 'Quantitative Techniques', percentage: 36 },
  ]

  return (
    <Card className="p-6 border">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Most Popular Learning Categories
      </h3>

      <div className="space-y-5">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">
                {category.name}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-400 h-3 rounded-full relative"
                  style={{ width: `${category.percentage}%` }}
                >
                  <div className="absolute -right-1 top-0 bg-white border-2 border-yellow-400 rounded-full w-4 h-3 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between text-xs text-gray-500 mt-6 px-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </Card>
  )
}

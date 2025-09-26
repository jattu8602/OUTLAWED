import { Card } from '@/components/ui/card'

export function PerformanceChart() {
  const tabs = ['TOPIC TEST', 'SECTIONAL TEST', 'MOCK TEST']
  const dataPoints = [18, 26, 24, 23, 36]

  return (
    <Card className="p-6 border max-w-2xl">
      <div className="flex space-x-8 mb-6 border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium transition-colors ${
              index === 0
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 500 240">
          {/* Grid lines */}
          {[0, 10, 20, 30, 40].map((value) => (
            <g key={value}>
              <line
                x1="40"
                y1={200 - (value / 40) * 160}
                x2="460"
                y2={200 - (value / 40) * 160}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="20"
                y={205 - (value / 40) * 160}
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          ))}

          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            points={dataPoints
              .map(
                (point, index) =>
                  `${index * 100 + 80},${200 - (point / 40) * 160}`
              )
              .join(' ')}
          />

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={index}
              cx={index * 100 + 80}
              cy={200 - (point / 40) * 160}
              r="4"
              fill="#22c55e"
            />
          ))}

          {/* X-axis labels */}
          {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map(
            (label, index) => (
              <text
                key={label}
                x={index * 100 + 80}
                y="230"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {label}
              </text>
            )
          )}
        </svg>
      </div>
    </Card>
  )
}

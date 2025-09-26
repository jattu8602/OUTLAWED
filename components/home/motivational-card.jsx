import { Card } from '@/components/ui/card'

export function MotivationalCard() {
  return (
    <Card className="p-6 bg-yellow-400 border-yellow-400">
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-black">Mistakes?</h3>
        <p className="text-lg text-black font-medium">
          Nah, that's me leveling up.
        </p>
      </div>
    </Card>
  )
}

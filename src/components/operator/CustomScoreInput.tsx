import { useState, KeyboardEvent } from 'react'
import { useShowStore } from '@/state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'

/**
 * Custom score input for entering arbitrary score values.
 * Applies score to active team on Enter key.
 * Clears and blurs on Escape key.
 */
export function CustomScoreInput() {
  const [value, setValue] = useState('')
  const [isNegative, setIsNegative] = useState(false)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const data = useShowStore((s) => s.data)

  const activeTeamName = rightsTurn
    ? data?.rightTeamName ?? 'الفريق الأيمن'
    : data?.leftTeamName ?? 'الفريق الأيسر'

  const applyScore = () => {
    const num = parseInt(value)
    if (isNaN(num) || num === 0) return

    const points = isNegative ? -Math.abs(num) : Math.abs(num)
    const { rightsTurn, addRightScore, addLeftScore } = useShowStore.getState()

    if (rightsTurn) {
      addRightScore(points)
    } else {
      addLeftScore(points)
    }

    // Clear after apply
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyScore()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setValue('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">نقاط مخصصة</label>
      <div className="flex gap-2 items-center">
        {/* +/- Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsNegative(!isNegative)}
          className="px-2"
        >
          {isNegative ? (
            <Minus className="size-4 text-red-600" />
          ) : (
            <Plus className="size-4 text-green-600" />
          )}
        </Button>

        {/* Number input */}
        <Input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="أدخل النقاط"
          className="flex-1"
        />

        {/* Apply button */}
        <Button type="button" size="sm" onClick={applyScore} disabled={!value || parseInt(value) === 0}>
          تطبيق
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        الفريق: <span className="font-medium">{activeTeamName}</span>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { useShowStore } from '@/state'
import { Button } from '@/components/ui/button'
import { CustomScoreInput } from './CustomScoreInput'
import { ScoringHistory } from './ScoringHistory'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Compact scoring controls panel for operator.
 * All presets in a tight single row, collapsible history.
 * Designed for mission-control density — no section headers or descriptive text.
 */
export function ScoringPanel() {
  const [showHistory, setShowHistory] = useState(false)

  const addActiveScore = (points: number) => {
    const { rightsTurn, addRightScore, addLeftScore } = useShowStore.getState()
    if (rightsTurn) {
      addRightScore(points)
    } else {
      addLeftScore(points)
    }
  }

  return (
    <div className="space-y-2 pt-1">
      {/* All scoring presets in one tight row */}
      <div className="flex flex-wrap gap-1">
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(1)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">1</kbd>
          +1
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(2)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">2</kbd>
          +2
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(5)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">5</kbd>
          +5
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(8)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">8</kbd>
          +8
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(10)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">0</kbd>
          +10
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(15)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">⇧5</kbd>
          +15
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => addActiveScore(16)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">⇧6</kbd>
          +16
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs text-red-600 dark:text-red-400"
          onClick={() => addActiveScore(-8)}
        >
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded me-1">-</kbd>
          -8
        </Button>
      </div>

      {/* Custom score input — inline */}
      <div className="pt-1">
        <CustomScoreInput />
      </div>

      {/* Collapsible scoring history */}
      <div className="pt-1 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-[11px] text-muted-foreground w-full justify-start"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? <ChevronUp className="size-3 me-1" /> : <ChevronDown className="size-3 me-1" />}
          سجل النقاط
        </Button>
        {showHistory && <ScoringHistory />}
      </div>
    </div>
  )
}

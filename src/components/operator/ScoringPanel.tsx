import { useShowStore } from '@/state'
import { Button } from '@/components/ui/button'
import { CustomScoreInput } from './CustomScoreInput'
import { ScoringHistory } from './ScoringHistory'
import { ArrowLeftRight, Undo, Redo, RefreshCcw } from 'lucide-react'

/**
 * Comprehensive scoring controls panel for operator.
 * Includes preset buttons, custom score input, quick actions, and scoring history.
 */
export function ScoringPanel() {
  const addActiveScore = (points: number) => {
    const { rightsTurn, addRightScore, addLeftScore } = useShowStore.getState()
    if (rightsTurn) {
      addRightScore(points)
    } else {
      addLeftScore(points)
    }
  }

  const handleToggleTurn = () => {
    const { toggleTurn } = useShowStore.getState()
    toggleTurn()
  }

  const handleSwapSides = () => {
    const { swapSides } = useShowStore.getState()
    swapSides()
  }

  const handleUndo = () => {
    const { undo } = useShowStore.temporal.getState()
    undo()
  }

  const handleRedo = () => {
    const { redo } = useShowStore.temporal.getState()
    redo()
  }

  return (
    <div className="space-y-6 mt-6 max-w-2xl mx-auto">
      {/* Section header */}
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold">التحكم بالنقاط</h2>
        <p className="text-xs text-muted-foreground mt-1">
          استخدم لوحة المفاتيح للتحكم السريع أثناء البث المباشر
        </p>
      </div>

      {/* Preset buttons - Positive scores */}
      <div>
        <p className="text-sm font-medium mb-2">نقاط محددة مسبقًا (للفريق النشط)</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => addActiveScore(1)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">1</kbd>
            +1
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(2)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">2</kbd>
            +2
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(5)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">5</kbd>
            +5
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(8)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">8</kbd>
            +8
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(10)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">0</kbd>
            +10
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(15)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">⇧5</kbd>
            +15
          </Button>
          <Button variant="outline" size="sm" onClick={() => addActiveScore(16)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">⇧6</kbd>
            +16
          </Button>
        </div>
      </div>

      {/* Preset buttons - Negative scores */}
      <div>
        <p className="text-sm font-medium mb-2">خصم نقاط</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => addActiveScore(-8)}>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded me-1">-</kbd>
            -8
          </Button>
        </div>
      </div>

      {/* Custom score input */}
      <div className="border-t pt-4">
        <CustomScoreInput />
      </div>

      {/* Quick actions */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">إجراءات سريعة</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleTurn}>
            <RefreshCcw className="size-4 me-1" />
            تبديل الدور
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">Space</kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSwapSides}>
            <ArrowLeftRight className="size-4 me-1" />
            تبديل الجوانب
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">⌘⇧S</kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo className="size-4 me-1" />
            تراجع
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">⌘Z</kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo}>
            <Redo className="size-4 me-1" />
            إعادة
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">⌘⇧Z</kbd>
          </Button>
        </div>
      </div>

      {/* Scoring history */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">سجل النقاط</p>
        <ScoringHistory />
      </div>
    </div>
  )
}

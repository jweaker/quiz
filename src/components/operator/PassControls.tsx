import { usePassMechanic } from '@/hooks/usePassMechanic'
import { useTimerStore, useShowStore } from '@/state'
import { Button } from '@/components/ui/button'
import { Check, X, ArrowRightLeft } from 'lucide-react'

/**
 * Operator controls for Poetic Chase pass mechanic.
 * Shows pass/correct/wrong actions and displays verse counts per team.
 */
export function PassControls() {
  const { passVerse, correctAnswer, wrongAnswer, passActive, passedToTeam } = usePassMechanic()

  const activeTimer = useTimerStore((s) => s.activeTimer)
  const verseCount = useTimerStore((s) => s.verseCount)
  const data = useShowStore((s) => s.data)

  const rightTeamName = data?.rightTeamName || 'الفريق الأيمن'
  const leftTeamName = data?.leftTeamName || 'الفريق الأيسر'

  // Determine which team name to show in pass status
  const passedToTeamName = passedToTeam === 'right' ? rightTeamName : passedToTeam === 'left' ? leftTeamName : ''

  return (
    <div className="space-y-4">
      {/* Pass status indicator */}
      {passActive && (
        <div className="p-3 border border-amber-500/50 bg-amber-500/10 rounded-lg">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400 text-center">
            تمرير نشط — الدور لـ {passedToTeamName}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div>
        <p className="text-sm font-medium mb-2">الإجراءات</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={passVerse}
            disabled={!activeTimer}
            className="hover:bg-blue-500/10 hover:border-blue-500/50"
          >
            <ArrowRightLeft className="size-4 me-1" />
            تمرير
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">g</kbd>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={correctAnswer}
            disabled={!activeTimer}
            className="hover:bg-green-500/10 hover:border-green-500/50"
          >
            <Check className="size-4 me-1" />
            صحيح
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">v</kbd>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={wrongAnswer}
            disabled={!activeTimer}
            className="hover:bg-red-500/10 hover:border-red-500/50"
          >
            <X className="size-4 me-1" />
            خطأ
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">x</kbd>
          </Button>
        </div>
      </div>

      {/* Verse count display */}
      <div>
        <p className="text-sm font-medium mb-2">عدد الأبيات</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg text-center bg-card">
            <p className="text-xs text-muted-foreground mb-1">{rightTeamName}</p>
            <p className="text-2xl font-bold western-numerals">{verseCount.right}</p>
            <p className="text-xs text-muted-foreground mt-1">بيت</p>
          </div>
          <div className="p-3 border rounded-lg text-center bg-card">
            <p className="text-xs text-muted-foreground mb-1">{leftTeamName}</p>
            <p className="text-2xl font-bold western-numerals">{verseCount.left}</p>
            <p className="text-xs text-muted-foreground mt-1">بيت</p>
          </div>
        </div>
      </div>
    </div>
  )
}

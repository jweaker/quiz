import { useStore } from 'zustand'
import { useShowStore } from '@/state'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

/**
 * Displays reverse-chronological list of scoring actions with revert capability.
 * Reads from temporal store's pastStates to show full scoring history.
 */
export function ScoringHistory() {
  const temporalStore = useShowStore.temporal
  const pastStates = useStore(temporalStore, (s) => s.pastStates)
  const undo = useStore(temporalStore, (s) => s.undo)

  // Get current team names from main store (not in temporal partialized state)
  const data = useShowStore((s) => s.data)
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'
  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'

  if (!pastStates || pastStates.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        لا توجد إجراءات بعد
      </div>
    )
  }

  // Compute deltas by comparing adjacent states
  const entries = pastStates
    .map((state, index) => {
      if (index === 0) return null // Skip first state (no previous to compare)

      const prevState = pastStates[index - 1]

      // Handle potentially undefined values from partialized state
      const rightDelta = (state.rightScore ?? 0) - (prevState?.rightScore ?? 0)
      const leftDelta = (state.leftScore ?? 0) - (prevState?.leftScore ?? 0)

      // Determine which team was affected
      let affectedTeam = ''
      let delta = 0

      if (rightDelta !== 0) {
        affectedTeam = rightTeamName
        delta = rightDelta
      } else if (leftDelta !== 0) {
        affectedTeam = leftTeamName
        delta = leftDelta
      }

      return {
        index,
        affectedTeam,
        delta,
        stepsBack: pastStates.length - index,
      }
    })
    .filter((entry) => entry !== null && entry.delta !== 0)
    .reverse() // Most recent first

  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        لا توجد إجراءات بعد
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-60 space-y-1">
      {entries.map((entry, idx) => (
        <div
          key={`${entry!.index}-${idx}`}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm"
        >
          <div className="flex items-center gap-2">
            <span
              className={
                'font-bold tabular-nums ' +
                (entry!.delta > 0 ? 'text-green-600' : 'text-red-600')
              }
            >
              {entry!.delta > 0 ? '+' : ''}
              {entry!.delta}
            </span>
            <span className="text-muted-foreground">{entry!.affectedTeam}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => undo(entry!.stepsBack)}
            className="h-7 px-2"
          >
            <RotateCcw className="size-3 me-1" />
            تراجع
          </Button>
        </div>
      ))}
    </div>
  )
}

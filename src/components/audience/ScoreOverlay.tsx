import { useShowStore } from '@/state'
import { TeamScore } from '@/components/score/TeamScore'

/**
 * Compact score overlay for audience display.
 * Fixed position at top of screen, always visible.
 * Shows both team scores with animations and active team glow.
 */
export function ScoreOverlay() {
  const rightScore = useShowStore((s) => s.rightScore)
  const leftScore = useShowStore((s) => s.leftScore)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)
  const data = useShowStore((s) => s.data)

  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'

  return (
    <div className="fixed top-6 left-0 right-0 flex items-center justify-center gap-8 px-6 z-10">
      {/* Right team */}
      <TeamScore
        variant="audience"
        teamName={rightTeamName}
        score={rightScore}
        isActive={rightsTurn && turned}
      />

      {/* Separator */}
      <div
        className="text-white font-bold opacity-50"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 4rem)' }}
      >
        :
      </div>

      {/* Left team */}
      <TeamScore
        variant="audience"
        teamName={leftTeamName}
        score={leftScore}
        isActive={!rightsTurn && turned}
      />
    </div>
  )
}

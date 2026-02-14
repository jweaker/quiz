import { useShowStore } from '@/state'
import { ThemeToggle } from '@/components/operator/ThemeToggle'
import { TeamScore } from '@/components/score/TeamScore'
import { ScoringPanel } from '@/components/operator/ScoringPanel'
import { useScoreControls } from '@/hooks/useScoreControls'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * Main operator controls area.
 * Shows current show state (scores, team names, turn) and full scoring controls.
 */
export default function OperatorControls() {
  // Register global keyboard shortcuts
  useScoreControls()
  const leftScore = useShowStore((s) => s.leftScore)
  const rightScore = useShowStore((s) => s.rightScore)
  const data = useShowStore((s) => s.data)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)
  const navigate = useNavigate()

  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">بشائر المعرفة</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            لوحة التحكم
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/operator/settings')}
          >
            <Settings className="size-4 me-1" />
            الإعدادات
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Scoreboard */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Right team (displayed on left in RTL) */}
          <TeamScore
            variant="operator"
            teamName={rightTeamName}
            score={rightScore}
            isActive={rightsTurn && turned}
          />
          {/* Left team (displayed on right in RTL) */}
          <TeamScore
            variant="operator"
            teamName={leftTeamName}
            score={leftScore}
            isActive={!rightsTurn && turned}
          />
        </div>

        {/* Turn indicator */}
        <div className="mt-6 max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            {turned
              ? `الدور: ${rightsTurn ? rightTeamName : leftTeamName}`
              : 'لم يبدأ الدور بعد'}
          </p>
        </div>

        {/* Scoring controls panel */}
        <ScoringPanel />
      </div>
    </div>
  )
}

import { useShowStore } from '@/state'
import { ThemeToggle } from '@/components/operator/ThemeToggle'
import { Monitor, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * Main operator controls area.
 * Shows current show state (scores, team names, turn) and header with theme toggle.
 * Placeholder content — actual show controls will be added in later phases.
 */
export default function OperatorControls() {
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
          <Button
            variant="outline"
            size="sm"
            disabled
            title="سيتم التفعيل في الخطة 03"
          >
            <Monitor className="size-4 me-1" />
            فتح شاشة الجمهور
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Scoreboard */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Right team (displayed on left in RTL) */}
          <ScoreCard
            teamName={rightTeamName}
            score={rightScore}
            isActive={rightsTurn && turned}
          />
          {/* Left team (displayed on right in RTL) */}
          <ScoreCard
            teamName={leftTeamName}
            score={leftScore}
            isActive={!rightsTurn && turned}
          />
        </div>

        {/* Show status */}
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            {turned
              ? `الدور: ${rightsTurn ? rightTeamName : leftTeamName}`
              : 'لم يبدأ الدور بعد'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Score card for a single team in the operator panel.
 */
function ScoreCard({
  teamName,
  score,
  isActive,
}: {
  teamName: string
  score: number
  isActive: boolean
}) {
  return (
    <div
      className={
        'rounded-lg border p-6 text-center transition-all ' +
        (isActive
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          : 'border-border bg-card')
      }
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{teamName}</p>
      <p className="text-5xl font-bold tabular-nums">{score}</p>
      {isActive && (
        <span className="inline-block mt-2 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
          الدور الحالي
        </span>
      )}
    </div>
  )
}

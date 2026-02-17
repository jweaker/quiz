import { useState } from 'react'
import { useShowStore, useTimerStore } from '@/state'
import { ThemeToggle } from '@/components/operator/ThemeToggle'
import { ScoringPanel } from '@/components/operator/ScoringPanel'
import { TimerPanel } from '@/components/operator/TimerPanel'
import { RundownRail } from '@/components/operator/RundownRail'
import { useScoreControls } from '@/hooks/useScoreControls'
import {
  Settings,
  RefreshCcw,
  ArrowLeftRight,
  Undo,
  Redo,
  Timer,
  Users,
  Play,
  Pause,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'motion/react'

type AdaptiveMode = 'scoring' | 'countdown' | 'chess-clock'

/**
 * Redesigned operator controls with persistent + adaptive zones.
 * No scrolling for core operations — compact, mission-control density.
 *
 * Persistent zone (top): scores + timer status + quick actions — always visible.
 * Adaptive zone (bottom): context-relevant controls (scoring / timer / chess clock).
 */
export default function OperatorControls() {
  // Register global keyboard shortcuts
  useScoreControls()

  const [adaptiveMode, setAdaptiveMode] = useState<AdaptiveMode>('scoring')

  // Show store
  const leftScore = useShowStore((s) => s.leftScore)
  const rightScore = useShowStore((s) => s.rightScore)
  const data = useShowStore((s) => s.data)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)

  // Timer store
  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)
  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const rightTimeMs = useTimerStore((s) => s.rightTimeMs)
  const leftTimeMs = useTimerStore((s) => s.leftTimeMs)
  const activeTimer = useTimerStore((s) => s.activeTimer)

  const navigate = useNavigate()

  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'

  // Score setters
  const setRightScore = useShowStore((s) => s.setRightScore)
  const setLeftScore = useShowStore((s) => s.setLeftScore)

  // Format seconds to MM:SS or SS
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}`
  }

  const formatMs = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return formatTime(seconds)
  }

  // Quick actions
  const handleToggleTurn = () => useShowStore.getState().toggleTurn()
  const handleSwapSides = () => useShowStore.getState().swapSides()
  const handleUndo = () => useShowStore.temporal.getState().undo()
  const handleRedo = () => useShowStore.temporal.getState().redo()

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <header className="flex items-center justify-between border-b px-3 py-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold">بشائر المعرفة</h1>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            لوحة التحكم
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => navigate('/operator/settings')}
          >
            <Settings className="size-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* PERSISTENT ZONE — always visible                   */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="border-b px-3 py-2">
        <div className="flex gap-3 items-stretch">
          {/* Left column: Compact team scores side-by-side */}
          <div className="flex gap-2 flex-1 min-w-0">
            {/* Right team (displayed first in RTL) */}
            <div
              className={
                'flex-1 rounded border px-3 py-2 text-center transition-all min-w-0 flex flex-col justify-center items-center h-full ' +
                (rightsTurn && turned
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card')
              }
            >
              <p className="text-[10px] font-medium text-muted-foreground truncate">
                {rightTeamName}
              </p>
              <input
                type="number"
                value={rightScore}
                onChange={(e) => setRightScore(Number(e.target.value))}
                className="text-3xl font-bold tabular-nums leading-tight text-center bg-transparent border-none outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {rightsTurn && turned && (
                <span className="text-[9px] text-primary font-medium">الدور</span>
              )}
            </div>

            {/* Left team */}
            <div
              className={
                'flex-1 rounded border px-3 py-2 text-center transition-all min-w-0 flex flex-col justify-center items-center h-full ' +
                (!rightsTurn && turned
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card')
              }
            >
              <p className="text-[10px] font-medium text-muted-foreground truncate">
                {leftTeamName}
              </p>
              <input
                type="number"
                value={leftScore}
                onChange={(e) => setLeftScore(Number(e.target.value))}
                className="text-3xl font-bold tabular-nums leading-tight text-center bg-transparent border-none outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {!rightsTurn && turned && (
                <span className="text-[9px] text-primary font-medium">الدور</span>
              )}
            </div>
          </div>

          {/* Center column: Timer status summary */}
          <div className="w-28 rounded border border-border bg-card px-3 py-2 text-center flex flex-col justify-center">
            {adaptiveMode === 'chess-clock' ? (
              <>
                <p className="text-[10px] text-muted-foreground">ساعة الشطرنج</p>
                <div className="flex justify-center gap-2 mt-0.5">
                  <span
                    className={
                      'text-sm font-bold tabular-nums western-numerals ' +
                      (activeTimer === 'right' ? 'text-primary' : 'text-muted-foreground')
                    }
                  >
                    {formatMs(rightTimeMs)}
                  </span>
                  <span className="text-muted-foreground text-xs">|</span>
                  <span
                    className={
                      'text-sm font-bold tabular-nums western-numerals ' +
                      (activeTimer === 'left' ? 'text-primary' : 'text-muted-foreground')
                    }
                  >
                    {formatMs(leftTimeMs)}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {activeTimer ? (activeTimer === 'right' ? 'أيمن ▶' : '◀ أيسر') : 'متوقف'}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-muted-foreground">المؤقت</p>
                <p className="text-2xl font-bold tabular-nums western-numerals leading-tight">
                  {formatTime(countdownRemaining)}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {countdownRunning ? (
                    <span className="text-green-500 flex items-center justify-center gap-0.5">
                      <Play className="size-2.5 fill-current" /> يعمل
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-0.5">
                      <Pause className="size-2.5" /> متوقف
                    </span>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Right column: Quick action buttons */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] justify-start"
              onClick={handleToggleTurn}
            >
              <RefreshCcw className="size-3 me-1 shrink-0" />
              <span className="truncate">الدور</span>
              <kbd className="ms-auto px-1 py-0 text-[9px] bg-muted rounded">Space</kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] justify-start"
              onClick={handleUndo}
            >
              <Undo className="size-3 me-1 shrink-0" />
              <span className="truncate">تراجع</span>
              <kbd className="ms-auto px-1 py-0 text-[9px] bg-muted rounded">⌘Z</kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] justify-start"
              onClick={handleRedo}
            >
              <Redo className="size-3 me-1 shrink-0" />
              <span className="truncate">إعادة</span>
              <kbd className="ms-auto px-1 py-0 text-[9px] bg-muted rounded">⌘⇧Z</kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] justify-start"
              onClick={handleSwapSides}
            >
              <ArrowLeftRight className="size-3 me-1 shrink-0" />
              <span className="truncate">تبديل</span>
              <kbd className="ms-auto px-1 py-0 text-[9px] bg-muted rounded">⌘⇧S</kbd>
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* RUNDOWN RAIL — section overview between zones       */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="border-b">
        <RundownRail />
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ADAPTIVE ZONE — changes per context                */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Mode switcher tabs */}
        <div className="flex gap-1 px-3 pt-2 pb-1">
          <Button
            variant={adaptiveMode === 'scoring' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => setAdaptiveMode('scoring')}
          >
            النقاط
          </Button>
          <Button
            variant={adaptiveMode === 'countdown' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => setAdaptiveMode('countdown')}
          >
            <Timer className="size-3 me-1" />
            عد تنازلي
          </Button>
          <Button
            variant={adaptiveMode === 'chess-clock' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => setAdaptiveMode('chess-clock')}
          >
            <Users className="size-3 me-1" />
            المطاردة
          </Button>
        </div>

        {/* Adaptive content with animated transitions */}
        <div className="flex-1 overflow-auto px-3 pb-3">
          <AnimatePresence mode="wait">
            {adaptiveMode === 'scoring' && (
              <motion.div
                key="scoring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScoringPanel />
              </motion.div>
            )}
            {adaptiveMode === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TimerPanel mode="countdown" />
              </motion.div>
            )}
            {adaptiveMode === 'chess-clock' && (
              <motion.div
                key="chess-clock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TimerPanel mode="chess-clock" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

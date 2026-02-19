import { useState } from 'react'
import { useShowStore, useTimerStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'
import animalsImage from '@/assets/animals.png'

const TOTAL_CELLS = 72

export function AskIntelligentlyPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const sectionState = useShowStore((s) => s.sectionState)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)
  const data = useShowStore((s) => s.data)
  const isActive = currentSection === 'ask-intelligently'

  const [started, setStarted] = useState(false)

  const remaining = 20 - sectionState.askedQuestions
  const activeTeamName = rightsTurn
    ? (data?.rightTeamName ?? 'الفريق الأيمن')
    : (data?.leftTeamName ?? 'الفريق الأيسر')

  // Start: award 20 points to asking team, begin 120s countdown
  const handleStart = () => {
    const { rightsTurn: isRight } = useShowStore.getState()
    if (isRight) {
      useShowStore.getState().addRightScore(20)
    } else {
      useShowStore.getState().addLeftScore(20)
    }
    useTimerStore.getState().setCountdown(120)
    useTimerStore.getState().setCountdownRunning(true)
    useShowStore.getState().setSectionState({ askedQuestions: 0, revealedAnimals: [] })
    setStarted(true)
  }

  // Deduct 1 point per question asked
  const handleDeduct = () => {
    const state = useShowStore.getState().sectionState
    const rem = 20 - state.askedQuestions
    if (rem > 0) {
      const { rightsTurn: isRight } = useShowStore.getState()
      if (isRight) {
        useShowStore.getState().addRightScore(-1)
      } else {
        useShowStore.getState().addLeftScore(-1)
      }
      useShowStore.getState().setSectionState({ askedQuestions: state.askedQuestions + 1 })
    }
  }

  // Click a specific animal cell to reveal it
  const handleCellClick = (index: number) => {
    if (!started) return
    const state = useShowStore.getState().sectionState
    if (state.revealedAnimals.includes(index)) return // already revealed
    const rem = 20 - state.askedQuestions
    if (rem <= 0) return

    // Deduct point
    const { rightsTurn: isRight } = useShowStore.getState()
    if (isRight) {
      useShowStore.getState().addRightScore(-1)
    } else {
      useShowStore.getState().addLeftScore(-1)
    }

    useShowStore.getState().setSectionState({
      askedQuestions: state.askedQuestions + 1,
      revealedAnimals: [...state.revealedAnimals, index],
    })
  }

  // End section early
  const handleEnd = () => {
    useTimerStore.getState().setCountdownRunning(false)
    setStarted(false)
  }

  // Q key: deduct 1 point (without specific cell)
  useHotkeys(
    'q',
    handleDeduct,
    { enabled: isActive && started, enableOnFormTags: false },
    [isActive, started]
  )

  // E key: end section early
  useHotkeys(
    'e',
    handleEnd,
    { enabled: isActive && started, enableOnFormTags: false },
    [isActive, started]
  )

  if (!isActive) return null

  // Color based on remaining points
  const barColor =
    remaining > 10 ? 'bg-green-500' : remaining > 5 ? 'bg-amber-500' : 'bg-red-500'
  const barPercent = (remaining / 20) * 100

  // Animal grid overlay component
  const animalGrid = (
    <div
      className="relative w-full rounded border border-border overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        backgroundImage: `url(${animalsImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 grid grid-cols-9" style={{ gridTemplateRows: 'repeat(8, 1fr)' }}>
        {Array.from({ length: TOTAL_CELLS }, (_, i) => {
          const isRevealed = sectionState.revealedAnimals.includes(i)
          return (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className={[
                'border border-white/10 transition-colors',
                started ? 'cursor-pointer' : 'cursor-default',
                isRevealed
                  ? 'bg-black/60'
                  : started
                    ? 'hover:bg-white/20'
                    : '',
              ].join(' ')}
            />
          )
        })}
      </div>
    </div>
  )

  if (!started) {
    // Pre-start phase
    return (
      <div className="space-y-3 pt-1">
        <span className="text-xs font-medium text-muted-foreground">اسأل بذكاء</span>

        {/* Animal grid */}
        {animalGrid}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>المدة: <span className="font-bold western-numerals">120</span> ثانية</p>
          <p>الفريق المتسائل: <span className="font-bold">{turned ? activeTeamName : 'لم يُحدد بعد'}</span></p>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full rounded border border-primary bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
        >
          بدء (+20 نقطة)
        </button>
      </div>
    )
  }

  // Active phase
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">اسأل بذكاء</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {remaining} / 20
        </span>
      </div>

      {/* Remaining points bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      {/* Animal grid */}
      {animalGrid}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDeduct}
          disabled={remaining <= 0}
          className="rounded border border-border bg-card px-3 py-2 text-sm text-center hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          سؤال −1 <kbd className="text-[9px] bg-muted rounded px-1 ms-1">Q</kbd>
        </button>
        <button
          onClick={handleEnd}
          className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-center text-destructive hover:bg-destructive/20 transition-colors"
        >
          إنهاء <kbd className="text-[9px] bg-muted rounded px-1 ms-1">E</kbd>
        </button>
      </div>
    </div>
  )
}

import { useShowStore, useTimerStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

const RAPID_TIMER_SECONDS = 60

export function RapidQuestionsPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'rapid-questions'

  const quickSets = data?.parts.quickQuestions ?? []
  const activeTeam = sectionState.rapidActiveTeam
  const currentSet = quickSets[0]
  const subQuestions = currentSet?.questions ?? []
  const currentSubQ = subQuestions[sectionState.questionIndex]
  const totalSubQ = subQuestions.length

  // S: switch active team — pause timer, reset to 60s
  useHotkeys('s', () => {
    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().setCountdown(RAPID_TIMER_SECONDS)
    const current = useShowStore.getState().sectionState.rapidActiveTeam
    const next = current === 'right' ? 'left' : 'right'
    useShowStore.getState().setSectionState({
      rapidActiveTeam: next,
      questionIndex: 0,
      answerRevealed: false,
    })
    useShowStore.getState().setRightsTurn(next === 'right')
    useShowStore.getState().setTurned(true)
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  // T: start/stop timer
  useHotkeys('t', () => {
    const timerStore = useTimerStore.getState()
    if (!timerStore.countdownRunning) {
      if (timerStore.countdownRemaining === 0) {
        timerStore.setCountdown(RAPID_TIMER_SECONDS)
      }
      timerStore.setCountdownRunning(true)
    } else {
      timerStore.setCountdownRunning(false)
    }
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  // N / ArrowRight: next sub-question
  useHotkeys('n, arrowright', () => {
    const state = useShowStore.getState().sectionState
    const newIndex = Math.min(state.questionIndex + 1, totalSubQ - 1)
    useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, totalSubQ])

  // B / ArrowLeft: previous sub-question
  useHotkeys('b, arrowleft', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ questionIndex: Math.max(0, state.questionIndex - 1), answerRevealed: false })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  // Enter: reveal/hide answer
  useHotkeys('enter', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ answerRevealed: !state.answerRevealed })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  if (!isActive) return null

  return (
    <div className="space-y-2 pt-1">
      {/* Active team indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">الرشق السريع</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {sectionState.questionIndex + 1} / {totalSubQ}
        </span>
      </div>

      {/* Set title */}
      {currentSet?.title && (
        <div className="rounded border border-border bg-muted/30 px-2 py-1 text-xs text-center font-medium">
          {currentSet.title}
        </div>
      )}

      {/* Active team banner */}
      <div className={
        'rounded border px-2 py-1.5 text-[11px] text-center font-medium ' +
        (activeTeam === 'right'
          ? 'border-primary/40 bg-primary/10 text-primary'
          : activeTeam === 'left'
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
            : 'border-border bg-card text-muted-foreground')
      }>
        {activeTeam
          ? `يجيب: ${activeTeam === 'right' ? 'الفريق الأيمن' : 'الفريق الأيسر'}`
          : 'اضغط S لاختيار الفريق'}
      </div>

      {/* Current question */}
      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[3rem]">
        {currentSubQ?.text ?? <span className="text-muted-foreground text-xs">لا يوجد سؤال</span>}
      </div>

      {/* Answer reveal */}
      {sectionState.answerRevealed && currentSubQ?.answer && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-xs text-right text-green-400 whitespace-pre-line leading-relaxed">
          {currentSubQ.answer}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => {
            useTimerStore.getState().setCountdownRunning(false)
            useTimerStore.getState().setCountdown(RAPID_TIMER_SECONDS)
            const current = useShowStore.getState().sectionState.rapidActiveTeam
            const next = current === 'right' ? 'left' : 'right'
            useShowStore.getState().setSectionState({ rapidActiveTeam: next, questionIndex: 0, answerRevealed: false })
            useShowStore.getState().setRightsTurn(next === 'right')
            useShowStore.getState().setTurned(true)
          }}
          className="rounded border border-border bg-card px-2 py-1.5 text-[11px] hover:bg-accent transition-colors"
        >
          تبديل الفريق <kbd className="text-[9px] bg-muted rounded px-1">S</kbd>
        </button>
        <button
          onClick={() => {
            const timerStore = useTimerStore.getState()
            if (!timerStore.countdownRunning) {
              if (timerStore.countdownRemaining === 0) timerStore.setCountdown(RAPID_TIMER_SECONDS)
              timerStore.setCountdownRunning(true)
            } else {
              timerStore.setCountdownRunning(false)
            }
          }}
          className="rounded border border-border bg-card px-2 py-1.5 text-[11px] hover:bg-accent transition-colors"
        >
          بدء/إيقاف <kbd className="text-[9px] bg-muted rounded px-1">T</kbd>
        </button>
      </div>
    </div>
  )
}

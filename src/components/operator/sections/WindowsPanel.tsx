import { useShowStore, useTimerStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

const WINDOWS_CATEGORIES = [
  { key: 'religion', label: 'الدين والسيرة' },
  { key: 'humanSciences', label: 'العلوم الإنسانية' },
  { key: 'naturalSciences', label: 'العلوم الطبيعية' },
  { key: 'arts', label: 'الأدب والفنون' },
  { key: 'misc', label: 'حقل الألغام' },
] as const

type WindowsCategoryKey = (typeof WINDOWS_CATEGORIES)[number]['key']

function getQuestionDuration(duration?: number): number {
  return duration && duration > 0 ? duration : 30
}

export function WindowsPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'windows'

  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)

  const windows = data?.parts.windows
  const activeCategory = sectionState.windowsActiveCategory as WindowsCategoryKey | null
  const inQuestionView = activeCategory !== null
  const hasSelectedQuestion = inQuestionView && sectionState.questionIndex >= 0

  const selectQuestion = (category: WindowsCategoryKey, questionIndex: number) => {
    const question = windows?.[category]?.[questionIndex]
    const duration = getQuestionDuration(question?.duration)

    useShowStore.getState().setSectionState({
      windowsActiveCategory: category,
      isMinefieldQuestion: category === 'misc',
      questionIndex,
      answerRevealed: false,
    })

    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().setCountdown(duration)
  }

  const selectCategory = (category: WindowsCategoryKey) => {
    useShowStore.getState().setSectionState({
      windowsActiveCategory: category,
      isMinefieldQuestion: category === 'misc',
      questionIndex: -1,
      answerRevealed: false,
    })
    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().resetTimer()
  }

  const backToCategoryPicker = () => {
    useShowStore.getState().setSectionState({
      windowsActiveCategory: null,
      isMinefieldQuestion: false,
      questionIndex: 0,
      answerRevealed: false,
    })
    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().resetTimer()
  }

  const toggleTimer = () => {
    if (!activeCategory) return
    const currentQuestion = windows?.[activeCategory]?.[sectionState.questionIndex]
    if (!currentQuestion) return
    const duration = getQuestionDuration(currentQuestion?.duration)

    const timer = useTimerStore.getState()
    if (timer.countdownRunning) {
      timer.setCountdownRunning(false)
      return
    }

    if (timer.countdownRemaining <= 0) {
      timer.setCountdown(duration)
    }
    timer.setCountdownRunning(true)
  }

  const resetTimer = () => {
    if (!activeCategory) return
    const currentQuestion = windows?.[activeCategory]?.[sectionState.questionIndex]
    if (!currentQuestion) return
    const duration = getQuestionDuration(currentQuestion?.duration)
    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().setCountdown(duration)
  }

  useHotkeys(
    'enter',
    () => {
      const state = useShowStore.getState().sectionState
      useShowStore.getState().setSectionState({ answerRevealed: !state.answerRevealed })
    },
    { enabled: isActive && hasSelectedQuestion, enableOnFormTags: false },
    [isActive, hasSelectedQuestion],
  )

  useHotkeys(
    'escape',
    backToCategoryPicker,
    { enabled: isActive && inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView],
  )

  useHotkeys(
    '1',
    () => {
      if (activeCategory) {
        selectQuestion(activeCategory, 0)
      } else {
        selectCategory('religion')
      }
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive, activeCategory],
  )

  useHotkeys(
    '2',
    () => {
      if (activeCategory) {
        selectQuestion(activeCategory, 1)
      } else {
        selectCategory('humanSciences')
      }
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive, activeCategory],
  )

  useHotkeys(
    '3',
    () => {
      if (!activeCategory) selectCategory('naturalSciences')
    },
    { enabled: isActive && !inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView],
  )

  useHotkeys(
    '4',
    () => {
      if (!activeCategory) selectCategory('arts')
    },
    { enabled: isActive && !inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView],
  )

  useHotkeys(
    '5',
    () => {
      if (!activeCategory) selectCategory('misc')
    },
    { enabled: isActive && !inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView],
  )

  useHotkeys(
    'BracketLeft',
    () => {
      if (!activeCategory) return
      const nextIndex = sectionState.questionIndex < 0 ? 0 : Math.max(0, sectionState.questionIndex - 1)
      selectQuestion(activeCategory, nextIndex)
    },
    { enabled: isActive && inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView, activeCategory, sectionState.questionIndex],
  )

  useHotkeys(
    'BracketRight',
    () => {
      if (!activeCategory) return
      const maxIndex = (windows?.[activeCategory]?.length ?? 1) - 1
      const nextIndex =
        sectionState.questionIndex < 0
          ? 0
          : Math.min(maxIndex, sectionState.questionIndex + 1)
      selectQuestion(activeCategory, nextIndex)
    },
    { enabled: isActive && inQuestionView, enableOnFormTags: false },
    [isActive, inQuestionView, activeCategory, sectionState.questionIndex, windows],
  )

  useHotkeys('t', toggleTimer, { enabled: isActive && hasSelectedQuestion, enableOnFormTags: false }, [
    isActive,
    hasSelectedQuestion,
    activeCategory,
    sectionState.questionIndex,
    windows,
  ])

  useHotkeys('shift+t', resetTimer, { enabled: isActive && hasSelectedQuestion, enableOnFormTags: false }, [
    isActive,
    hasSelectedQuestion,
    activeCategory,
    sectionState.questionIndex,
    windows,
  ])

  if (!isActive) return null

  if (!activeCategory) {
    return (
      <div className="space-y-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">نوافذ المعرفة</span>
        <div className="grid grid-cols-2 gap-1.5">
          {WINDOWS_CATEGORIES.map((cat) => {
            const catQuestions = windows?.[cat.key] ?? []
            const allDone = catQuestions.length > 0 && catQuestions.every((q: { done?: boolean }) => q.done)
            const doneCount = catQuestions.filter((q: { done?: boolean }) => q.done).length

            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={
                  'rounded border px-2 py-2 text-[11px] text-right transition-colors ' +
                  (cat.key === 'misc'
                    ? 'border-red-500/40 bg-red-500/10 hover:bg-red-500/20'
                    : allDone
                      ? 'border-muted bg-muted/30 text-muted-foreground line-through'
                      : 'border-border bg-card hover:bg-accent')
                }
              >
                <div className="font-medium">{cat.label}</div>
                <div className="mt-0.5 text-[9px] text-muted-foreground western-numerals">
                  {doneCount}/{catQuestions.length}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const catQuestions = windows?.[activeCategory] ?? []
  const currentQuestion = catQuestions[sectionState.questionIndex]
  const currentDuration = currentQuestion ? getQuestionDuration(currentQuestion.duration) : 0
  const isMinefield = activeCategory === 'misc'
  const catLabel = WINDOWS_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? ''

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <button
          onClick={backToCategoryPicker}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← كل النوافذ
        </button>
        <span className="text-xs font-medium">{catLabel}</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {sectionState.questionIndex >= 0 ? sectionState.questionIndex + 1 : 0} / {catQuestions.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {catQuestions.map((q: { done?: boolean }, i: number) => (
          <button
            key={i}
            onClick={() => selectQuestion(activeCategory, i)}
            className={
              'rounded border px-2 py-1.5 text-[11px] transition-colors western-numerals ' +
              (i === sectionState.questionIndex
                ? 'border-primary bg-primary/10 text-primary'
                : q.done
                  ? 'border-muted bg-muted/30 text-muted-foreground line-through'
                  : 'border-border bg-card hover:bg-accent')
            }
          >
            {i + 1}
          </button>
        ))}
      </div>

      {isMinefield && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] text-red-400 text-center">
          صحيح +16 · خطأ -8 · تمرير/جزئي 0
        </div>
      )}

      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[4rem]">
        {currentQuestion?.text ?? <span className="text-muted-foreground text-xs">اختر رقم السؤال</span>}
      </div>

      {sectionState.answerRevealed && currentQuestion?.answer && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-sm text-right text-green-400 whitespace-pre-line leading-relaxed">
          {currentQuestion.answer}
        </div>
      )}

      <div className="rounded border border-border bg-muted/30 p-2 text-[10px] text-muted-foreground space-y-1">
        {currentQuestion ? (
          <>
            <p>
              مؤقت السؤال: <span className="font-bold text-foreground western-numerals">{currentDuration}</span> ثانية
            </p>
            <p className="western-numerals">
              المتبقي: {countdownRemaining}
              {countdownRunning ? ' (يعمل)' : ' (متوقف)'}
            </p>
          </>
        ) : (
          <p>اختر سؤالاً لتهيئة المؤقت</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={toggleTimer}
          className="rounded border border-border bg-card px-2 py-1.5 text-[11px] hover:bg-accent transition-colors"
        >
          بدء/إيقاف <kbd className="text-[9px] bg-muted rounded px-1">T</kbd>
        </button>
        <button
          onClick={resetTimer}
          className="rounded border border-border bg-card px-2 py-1.5 text-[11px] hover:bg-accent transition-colors"
        >
          إعادة <kbd className="text-[9px] bg-muted rounded px-1">⇧T</kbd>
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5">1..5</kbd>
        <span className="text-[9px] text-muted-foreground">اختيار نافذة</span>
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">1..2</kbd>
        <span className="text-[9px] text-muted-foreground">اختيار سؤال</span>
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">[ ]</kbd>
        <span className="text-[9px] text-muted-foreground">تنقل سريع</span>
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">Enter</kbd>
        <span className="text-[9px] text-muted-foreground">كشف الإجابة</span>
      </div>
    </div>
  )
}

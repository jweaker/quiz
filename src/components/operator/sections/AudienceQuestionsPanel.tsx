import { useShowStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

export function AudienceQuestionsPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'audience-questions'

  const questions = data?.parts.audienceQuestions ?? []
  const totalQuestions = questions.length
  const currentQ = questions[sectionState.questionIndex]

  // Enter: toggle answer reveal
  useHotkeys('enter', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ answerRevealed: !state.answerRevealed })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  // N / ArrowRight: next question
  useHotkeys('n, arrowright', () => {
    const state = useShowStore.getState().sectionState
    const newIndex = state.questionIndex + 1
    if (newIndex < questions.length) useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, questions.length])

  // B / ArrowLeft: previous question
  useHotkeys('b, arrowleft', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ questionIndex: Math.max(0, state.questionIndex - 1), answerRevealed: false })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  if (!isActive) return null

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">أسئلة الجمهور</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {sectionState.questionIndex + 1} / {totalQuestions}
        </span>
      </div>
      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[3rem]">
        {currentQ?.text ?? <span className="text-muted-foreground text-xs">لا يوجد سؤال</span>}
      </div>
      {sectionState.answerRevealed && currentQ?.answer && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-sm text-right text-green-400 leading-relaxed">
          {currentQ.answer}
        </div>
      )}
      <div className="flex gap-1">
        <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5">Enter</kbd>
        <span className="text-[10px] text-muted-foreground">كشف الجواب</span>
        <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5 ms-2">N</kbd>
        <span className="text-[10px] text-muted-foreground">السؤال التالي</span>
      </div>
    </div>
  )
}

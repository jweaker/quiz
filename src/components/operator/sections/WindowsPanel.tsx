import { useState } from 'react'
import { useShowStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

const WINDOWS_CATEGORIES = [
  { key: 'naturalSciences', label: 'العلوم الطبيعية' },
  { key: 'humanSciences',   label: 'العلوم الإنسانية' },
  { key: 'misc',            label: 'أسئلة عامة' },
  { key: 'arts',            label: 'الأدب والفنون' },
  { key: 'religion',        label: 'الدين والسيرة' },
] as const

type WindowsCategoryKey = typeof WINDOWS_CATEGORIES[number]['key']

export function WindowsPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'windows'

  const [selectedCategory, setSelectedCategory] = useState<WindowsCategoryKey | 'minefield' | null>(null)

  const windows = data?.parts.windows
  // Minefield uses misc questions with isMinefieldQuestion flag
  const mineQuestions = windows?.misc ?? []

  const selectCategory = (cat: WindowsCategoryKey | 'minefield') => {
    setSelectedCategory(cat)
    const isMinefield = cat === 'minefield'
    useShowStore.getState().setSectionState({
      questionIndex: 0,
      answerRevealed: false,
      isMinefieldQuestion: isMinefield,
      windowsActiveCategory: cat,
    })
  }

  const backToPicker = () => {
    setSelectedCategory(null)
    useShowStore.getState().setSectionState({
      questionIndex: 0,
      answerRevealed: false,
      isMinefieldQuestion: false,
      windowsActiveCategory: null,
    })
  }

  // Hotkeys only when in question view (selectedCategory is set)
  const inQuestionView = selectedCategory !== null

  // Enter: toggle answerRevealed
  useHotkeys('enter', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ answerRevealed: !state.answerRevealed })
  }, { enabled: isActive && inQuestionView, enableOnFormTags: false }, [isActive, inQuestionView])

  // N / ArrowRight: next question in category
  useHotkeys('n, arrowright', () => {
    const state = useShowStore.getState().sectionState
    const maxIndex = selectedCategory === 'minefield'
      ? (mineQuestions.length - 1)
      : ((windows?.[selectedCategory as WindowsCategoryKey]?.length ?? 1) - 1)
    const newIndex = Math.min(state.questionIndex + 1, maxIndex)
    useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
  }, { enabled: isActive && inQuestionView, enableOnFormTags: false }, [isActive, inQuestionView, selectedCategory, windows])

  // B / ArrowLeft: previous question
  useHotkeys('b, arrowleft', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ questionIndex: Math.max(0, state.questionIndex - 1), answerRevealed: false })
  }, { enabled: isActive && inQuestionView, enableOnFormTags: false }, [isActive, inQuestionView])

  // Escape: back to category picker
  useHotkeys('escape', backToPicker, { enabled: isActive && inQuestionView, enableOnFormTags: false }, [isActive, inQuestionView])

  if (!isActive) return null

  // -- Category Picker view --
  if (!selectedCategory) {
    return (
      <div className="space-y-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">اختر النافذة</span>
        <div className="grid grid-cols-2 gap-1.5">
          {WINDOWS_CATEGORIES.map((cat) => {
            const catQuestions = windows?.[cat.key] ?? []
            const allDone = catQuestions.every((q: { done?: boolean }) => q.done)
            const someDone = catQuestions.some((q: { done?: boolean }) => q.done)
            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={
                  'rounded border px-2 py-2 text-[11px] text-right transition-colors ' +
                  (allDone
                    ? 'border-muted bg-muted/30 text-muted-foreground line-through'
                    : someDone
                      ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'border-border bg-card hover:bg-accent')
                }
              >
                {cat.label}
                <span className="ms-1 text-[9px] text-muted-foreground">
                  {catQuestions.filter((q: { done?: boolean }) => q.done).length}/{catQuestions.length}
                </span>
              </button>
            )
          })}
          {/* Minefield entry */}
          <button
            onClick={() => selectCategory('minefield')}
            className="rounded border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-2 text-[11px] text-right transition-colors col-span-2"
          >
            حقل الألغام ⚠ <span className="text-[9px] text-muted-foreground">(+16 / -8 / 0)</span>
          </button>
        </div>
      </div>
    )
  }

  // -- Question view --
  const isMinefield = selectedCategory === 'minefield'
  const catQuestions = isMinefield ? mineQuestions : (windows?.[selectedCategory as WindowsCategoryKey] ?? [])
  const currentQ = catQuestions[sectionState.questionIndex]
  const catLabel = isMinefield
    ? 'حقل الألغام'
    : WINDOWS_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? ''

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <button onClick={backToPicker} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          ← الكل
        </button>
        <span className="text-xs font-medium">{catLabel}</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {sectionState.questionIndex + 1} / {catQuestions.length}
        </span>
      </div>

      {isMinefield && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] text-red-400 text-center">
          صحيح +16 <kbd className="bg-muted rounded px-1 text-foreground">⇧6</kbd> ·
          خطأ -8 <kbd className="bg-muted rounded px-1 text-foreground">-</kbd> ·
          جزئي 0
        </div>
      )}

      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[4rem]">
        {currentQ?.text ?? <span className="text-muted-foreground text-xs">لا يوجد سؤال</span>}
      </div>

      {sectionState.answerRevealed && currentQ?.answer && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-sm text-right text-green-400 whitespace-pre-line leading-relaxed">
          {currentQ.answer}
        </div>
      )}

      <div className="flex gap-1 flex-wrap">
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5">Enter</kbd>
        <span className="text-[9px] text-muted-foreground">كشف</span>
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">N</kbd>
        <span className="text-[9px] text-muted-foreground">تالي</span>
        <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">Esc</kbd>
        <span className="text-[9px] text-muted-foreground">رجوع</span>
        {!isMinefield && (
          <>
            <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">2</kbd>
            <span className="text-[9px] text-muted-foreground">+2</span>
            <kbd className="text-[9px] bg-muted rounded px-1.5 py-0.5 ms-1">8</kbd>
            <span className="text-[9px] text-muted-foreground">+8</span>
          </>
        )}
      </div>
    </div>
  )
}

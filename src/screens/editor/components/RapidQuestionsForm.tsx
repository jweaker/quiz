import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import QuestionListEditor from './QuestionListEditor'
import type { QuickQuestionSet } from '@/lib/episodeSchema'

export interface RapidQuestionsFormProps {
  quickQuestions: QuickQuestionSet[]
  onChange: (quickQuestions: QuickQuestionSet[]) => void
  errors?: Record<string, string[]>
}

export default function RapidQuestionsForm({
  quickQuestions,
  onChange,
  errors,
}: RapidQuestionsFormProps) {
  // Rapid questions edits quickQuestions[0] — the first (and primary) quick question set
  const set = quickQuestions[0] ?? { title: '', questions: [] }

  const updateSet = (update: Partial<QuickQuestionSet>) => {
    const updated: QuickQuestionSet = { ...set, ...update }
    const next = [...quickQuestions]
    if (next.length === 0) {
      next.push(updated)
    } else {
      next[0] = updated
    }
    onChange(next)
  }

  const titleErrors = errors
    ? Object.entries(errors)
        .filter(([k]) => k.includes('quickQuestions') && k.includes('title'))
        .flatMap(([, v]) => v)
    : []

  return (
    <div
      id="section-rapid-questions"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">الرشق السريع</h2>

      {/* Set title */}
      <div className="space-y-2">
        <Label htmlFor="rapid-title">عنوان مجموعة الأسئلة</Label>
        <Input
          id="rapid-title"
          placeholder="مثال: ما؟"
          value={set.title}
          onChange={(e) => updateSet({ title: e.target.value })}
        />
        {titleErrors.length > 0 && (
          <div className="text-xs text-destructive">
            {titleErrors.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
        )}
      </div>

      {/* Questions list */}
      {quickQuestions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            لا توجد مجموعة أسئلة سريعة بعد
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange([{ title: '', questions: [{ text: '', answer: '', duration: 45, marks: 2 }] }])
            }
          >
            <Plus className="size-4" />
            إنشاء مجموعة
          </Button>
        </div>
      ) : (
        <QuestionListEditor
          questions={set.questions}
          onChange={(questions) => updateSet({ questions })}
          errors={errors}
          showMarks={false}
          showDuration={false}
        />
      )}
    </div>
  )
}

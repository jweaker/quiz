import { useState, useCallback, useRef } from 'react'
import { X, Plus, ClipboardPaste } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Question } from '@/lib/episodeSchema'
import BulkPasteDialog from './BulkPasteDialog'

export interface QuestionListEditorProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
  errors?: Record<string, string[]>
  showMarks?: boolean
  showDuration?: boolean
}

const blankQuestion = (): Question => ({
  text: '',
  answer: '',
  duration: 30,
  marks: 0,
})

export default function QuestionListEditor({
  questions,
  onChange,
  errors,
  showMarks = true,
  showDuration = false,
}: QuestionListEditorProps) {
  const [bulkPasteOpen, setBulkPasteOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const updateQuestion = useCallback(
    (index: number, field: keyof Question, value: string | number | boolean) => {
      const next = questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
      onChange(next)
    },
    [questions, onChange]
  )

  const addQuestion = useCallback(() => {
    onChange([...questions, blankQuestion()])
  }, [questions, onChange])

  const removeQuestion = useCallback(
    (index: number) => {
      onChange(questions.filter((_, i) => i !== index))
    },
    [questions, onChange]
  )

  const handleBulkAdd = useCallback(
    (parsed: Question[]) => {
      onChange([...questions, ...parsed])
      setBulkPasteOpen(false)
    },
    [questions, onChange]
  )

  const handleBulkReplace = useCallback(
    (parsed: Question[]) => {
      onChange(parsed)
      setBulkPasteOpen(false)
    },
    [onChange]
  )

  const getFieldError = (index: number, field: string): string[] | undefined => {
    if (!errors) return undefined
    // Match patterns like "speedQuestions.0.text" or just "0.text"
    const keys = Object.keys(errors).filter(
      (k) => k.endsWith(`.${index}.${field}`) || k === `${index}.${field}`
    )
    const msgs: string[] = []
    for (const k of keys) {
      msgs.push(...(errors[k] ?? []))
    }
    return msgs.length > 0 ? msgs : undefined
  }

  return (
    <div className="space-y-3" ref={listRef}>
      {questions.map((q, i) => (
        <div
          key={i}
          className="group relative rounded-md border border-border bg-background p-3 space-y-2"
        >
          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => removeQuestion(i)}
            aria-label="حذف السؤال"
          >
            <X className="size-3.5" />
          </Button>

          {/* Question number badge */}
          <span className="absolute top-2 right-3 text-xs text-muted-foreground font-mono">
            {i + 1}
          </span>

          {/* Question text */}
          <div className="space-y-1 pt-4">
            <textarea
              className="w-full min-h-[2.5rem] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              placeholder="نص السؤال"
              value={q.text}
              onChange={(e) => updateQuestion(i, 'text', e.target.value)}
              rows={1}
            />
            <FieldErrors msgs={getFieldError(i, 'text')} />
          </div>

          {/* Answer */}
          <div className="space-y-1">
            <Input
              placeholder="الإجابة"
              value={q.answer}
              onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
            />
            <FieldErrors msgs={getFieldError(i, 'answer')} />
          </div>

          {/* Duration + Marks row */}
          <div className="flex gap-3">
            {showDuration && (
              <div className="space-y-1 w-28">
                <Input
                  type="number"
                  min={1}
                  placeholder="المدة (ث)"
                  value={q.duration}
                  onChange={(e) =>
                    updateQuestion(i, 'duration', Number(e.target.value) || 30)
                  }
                />
                <FieldErrors msgs={getFieldError(i, 'duration')} />
              </div>
            )}
            {showMarks && (
              <div className="space-y-1 w-28">
                <Input
                  type="number"
                  min={0}
                  placeholder="النقاط"
                  value={q.marks}
                  onChange={(e) =>
                    updateQuestion(i, 'marks', Number(e.target.value) || 0)
                  }
                />
                <FieldErrors msgs={getFieldError(i, 'marks')} />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Actions row */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="size-4" />
          إضافة سؤال
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBulkPasteOpen(true)}
        >
          <ClipboardPaste className="size-4" />
          لصق مجمّع
        </Button>
      </div>

      <BulkPasteDialog
        open={bulkPasteOpen}
        onOpenChange={setBulkPasteOpen}
        onAdd={handleBulkAdd}
        onReplace={handleBulkReplace}
      />
    </div>
  )
}

function FieldErrors({ msgs }: { msgs?: string[] }) {
  if (!msgs || msgs.length === 0) return null
  return (
    <div className="text-xs text-destructive">
      {msgs.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  )
}

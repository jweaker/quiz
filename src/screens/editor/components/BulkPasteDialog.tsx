import { useState, useCallback } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { parsePastedQuestions, detectPasteFormat } from '@/lib/pasteParser'
import type { PasteFormat } from '@/lib/pasteParser'
import type { Question } from '@/lib/episodeSchema'

const formatLabels: Record<PasteFormat, string> = {
  json: 'JSON',
  tsv: 'جدول (TSV)',
  'qa-pairs': 'سؤال / جواب',
  lines: 'سطور نصية',
}

export interface BulkPasteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (questions: Question[]) => void
  onReplace: (questions: Question[]) => void
}

export default function BulkPasteDialog({
  open,
  onOpenChange,
  onAdd,
  onReplace,
}: BulkPasteDialogProps) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<Question[]>([])
  const [format, setFormat] = useState<PasteFormat>('lines')

  const handleTextChange = useCallback((value: string) => {
    setText(value)
    if (value.trim()) {
      const detected = detectPasteFormat(value)
      setFormat(detected)
      setParsed(parsePastedQuestions(value))
    } else {
      setParsed([])
      setFormat('lines')
    }
  }, [])

  const handleClose = useCallback(() => {
    setText('')
    setParsed([])
    setFormat('lines')
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="text-lg font-semibold">
            لصق مجمّع
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1">
            ألصق الأسئلة بأي صيغة (JSON، جدول، سؤال/جواب، أو سطور)
          </DialogPrimitive.Description>

          {/* Textarea */}
          <textarea
            className="mt-4 w-full min-h-[160px] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            dir="auto"
            placeholder="ألصق الأسئلة هنا..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 space-y-2">
              <p className="text-sm font-medium">
                تم اكتشاف {parsed.length} سؤال — الصيغة: {formatLabels[format]}
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {parsed.slice(0, 3).map((q, i) => (
                  <p key={i} className="truncate">
                    <span className="font-mono text-foreground/70">{i + 1}.</span>{' '}
                    {q.text}
                    {q.answer ? ` ← ${q.answer}` : ''}
                  </p>
                ))}
                {parsed.length > 3 && (
                  <p className="text-muted-foreground/60">
                    ... و {parsed.length - 3} أسئلة أخرى
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={handleClose}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={parsed.length === 0}
              onClick={() => {
                onReplace(parsed)
                handleClose()
              }}
            >
              استبدال
            </Button>
            <Button
              type="button"
              disabled={parsed.length === 0}
              onClick={() => {
                onAdd(parsed)
                handleClose()
              }}
            >
              إضافة
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

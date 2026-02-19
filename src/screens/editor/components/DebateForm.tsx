import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Question } from '@/lib/episodeSchema'

export interface DebateFormProps {
  debate: Question
  onChange: (debate: Question) => void
  debateDuration?: number
  onDurationChange?: (duration: number) => void
  errors?: Record<string, string[]>
}

export default function DebateForm({
  debate,
  onChange,
  debateDuration,
  onDurationChange,
  errors,
}: DebateFormProps) {
  const topicErrors = errors
    ? Object.entries(errors)
        .filter(([k]) => k.includes('debate') && k.includes('text'))
        .flatMap(([, v]) => v)
    : []

  return (
    <div
      id="section-debate"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">النقاش</h2>

      {/* Debate topic */}
      <div className="space-y-2">
        <Label htmlFor="debate-topic">موضوع النقاش</Label>
        <textarea
          id="debate-topic"
          className="w-full min-h-[4rem] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          placeholder="أدخل موضوع النقاش"
          value={debate.text}
          onChange={(e) => onChange({ ...debate, text: e.target.value })}
          rows={2}
        />
        {topicErrors.length > 0 && (
          <div className="text-xs text-destructive">
            {topicErrors.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
        )}
      </div>

      {/* Duration */}
      {onDurationChange && (
        <div className="flex items-center gap-3">
          <Label htmlFor="debate-duration" className="shrink-0">
            مدة النقاش (ثانية)
          </Label>
          <Input
            id="debate-duration"
            type="number"
            min={1}
            className="w-28"
            value={debateDuration ?? 60}
            onChange={(e) => onDurationChange(Number(e.target.value) || 60)}
          />
        </div>
      )}
    </div>
  )
}

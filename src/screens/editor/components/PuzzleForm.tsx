import QuestionListEditor from './QuestionListEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Question } from '@/lib/episodeSchema'

export interface PuzzleFormProps {
  puzzles: Question[]
  onChange: (puzzles: Question[]) => void
  puzzleDuration?: number
  onDurationChange?: (duration: number) => void
  errors?: Record<string, string[]>
}

export default function PuzzleForm({
  puzzles,
  onChange,
  puzzleDuration,
  onDurationChange,
  errors,
}: PuzzleFormProps) {
  return (
    <div
      id="section-puzzles"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">الألغاز</h2>

      {/* Puzzle duration override */}
      {onDurationChange && (
        <div className="flex items-center gap-3">
          <Label htmlFor="puzzle-duration" className="shrink-0">
            مدة الألغاز (ثانية)
          </Label>
          <Input
            id="puzzle-duration"
            type="number"
            min={1}
            className="w-28"
            value={puzzleDuration ?? 90}
            onChange={(e) => onDurationChange(Number(e.target.value) || 90)}
          />
        </div>
      )}

      <QuestionListEditor
        questions={puzzles}
        onChange={onChange}
        errors={errors}
        showMarks={false}
        showDuration={true}
      />
    </div>
  )
}

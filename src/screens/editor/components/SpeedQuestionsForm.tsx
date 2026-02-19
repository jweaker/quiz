import QuestionListEditor from './QuestionListEditor'
import type { Question } from '@/lib/episodeSchema'

export interface SpeedQuestionsFormProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
  errors?: Record<string, string[]>
}

export default function SpeedQuestionsForm({
  questions,
  onChange,
  errors,
}: SpeedQuestionsFormProps) {
  return (
    <div
      id="section-speed-questions"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">سؤال السرعة</h2>
      <QuestionListEditor
        questions={questions}
        onChange={onChange}
        errors={errors}
        showMarks={false}
        showDuration={false}
      />
    </div>
  )
}

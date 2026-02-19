import QuestionListEditor from './QuestionListEditor'
import type { Question } from '@/lib/episodeSchema'

export interface AudienceQuestionsFormProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
  errors?: Record<string, string[]>
}

export default function AudienceQuestionsForm({
  questions,
  onChange,
  errors,
}: AudienceQuestionsFormProps) {
  return (
    <div
      id="section-audience-questions"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">أسئلة الجمهور</h2>
      <p className="text-sm text-muted-foreground">
        هذه الأسئلة تُعرض بين الأقسام الرئيسية
      </p>
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

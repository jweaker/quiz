import { useCallback } from 'react'
import QuestionListEditor from './QuestionListEditor'
import type { WindowsData, WindowsCategoryKey, Question } from '@/lib/episodeSchema'

const categoryLabels: Record<WindowsCategoryKey, string> = {
  naturalSciences: 'العلوم الطبيعية',
  humanSciences: 'العلوم الإنسانية',
  misc: 'المتفرقات',
  arts: 'الفنون',
  religion: 'الدين',
}

const categoryKeys: WindowsCategoryKey[] = [
  'naturalSciences',
  'humanSciences',
  'misc',
  'arts',
  'religion',
]

const MAX_QUESTIONS_PER_CATEGORY = 2

export interface WindowsFormProps {
  windows: WindowsData
  onChange: (windows: WindowsData) => void
  errors?: Record<string, string[]>
}

export default function WindowsForm({ windows, onChange, errors }: WindowsFormProps) {
  const updateCategory = useCallback(
    (key: WindowsCategoryKey, questions: Question[]) => {
      onChange({ ...windows, [key]: questions })
    },
    [windows, onChange]
  )

  // Filter errors for a specific category
  const getCategoryErrors = (key: WindowsCategoryKey): Record<string, string[]> | undefined => {
    if (!errors) return undefined
    const filtered: Record<string, string[]> = {}
    const prefix = `windows.${key}.`
    for (const [k, v] of Object.entries(errors)) {
      if (k.startsWith(prefix)) {
        filtered[k.slice(prefix.length)] = v
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : undefined
  }

  return (
    <div
      id="section-windows"
      className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6"
    >
      <h2 className="text-lg font-semibold">نوافذ المعرفة</h2>

      {categoryKeys.map((key) => {
        const questions = windows[key] ?? []
        const atMax = questions.length >= MAX_QUESTIONS_PER_CATEGORY

        return (
          <div key={key} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {categoryLabels[key]}
              <span className="text-xs mr-2">
                ({questions.length}/{MAX_QUESTIONS_PER_CATEGORY})
              </span>
            </h3>

            <QuestionListEditor
              questions={questions}
              onChange={(q) => {
                // Enforce max limit
                if (q.length > MAX_QUESTIONS_PER_CATEGORY) return
                updateCategory(key, q)
              }}
              errors={getCategoryErrors(key)}
              showMarks={true}
              showDuration={false}
            />

            {atMax && (
              <p className="text-xs text-muted-foreground">
                الحد الأقصى {MAX_QUESTIONS_PER_CATEGORY} أسئلة لكل فئة
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

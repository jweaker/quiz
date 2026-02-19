interface ValidationSummaryProps {
  errors: Record<string, string[]>
}

/** Map error field keys to section element IDs and Arabic labels */
const sectionMap: Record<string, { id: string; label: string }> = {
  leftTeamName: { id: 'section-metadata', label: 'بيانات الحلقة' },
  rightTeamName: { id: 'section-metadata', label: 'بيانات الحلقة' },
  title: { id: 'section-metadata', label: 'بيانات الحلقة' },
  date: { id: 'section-metadata', label: 'بيانات الحلقة' },
  settings: { id: 'section-metadata', label: 'بيانات الحلقة' },
  speedQuestions: { id: 'section-speed-questions', label: 'سؤال السرعة' },
  windows: { id: 'section-windows', label: 'نوافذ المعرفة' },
  puzzles: { id: 'section-puzzle', label: 'الألغاز' },
  debate: { id: 'section-debate', label: 'النقاش' },
  quickQuestions: { id: 'section-rapid-questions', label: 'الرشق السريع' },
  audienceQuestions: { id: 'section-audience-questions', label: 'أسئلة الجمهور' },
  parts: { id: 'section-speed-questions', label: 'أقسام الحلقة' },
  _form: { id: 'section-metadata', label: 'عام' },
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function ValidationSummary({ errors }: ValidationSummaryProps) {
  const keys = Object.keys(errors)
  if (keys.length === 0) return null

  // Group errors by section
  const grouped = new Map<string, { id: string; label: string; messages: string[] }>()

  for (const [field, msgs] of Object.entries(errors)) {
    if (!msgs || msgs.length === 0) continue
    const section = sectionMap[field] ?? { id: 'section-metadata', label: field }
    const existing = grouped.get(section.label)
    if (existing) {
      existing.messages.push(...msgs)
    } else {
      grouped.set(section.label, { id: section.id, label: section.label, messages: [...msgs] })
    }
  }

  const totalErrors = Array.from(grouped.values()).reduce((n, g) => n + g.messages.length, 0)

  return (
    <div
      id="section-validation"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 shadow-sm space-y-3"
    >
      <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
        <span>⚠️</span>
        {totalErrors} {totalErrors === 1 ? 'خطأ' : 'أخطاء'}
      </h2>

      {Array.from(grouped.entries()).map(([label, group]) => (
        <div key={label}>
          <button
            type="button"
            onClick={() => scrollToSection(group.id)}
            className="text-sm font-medium text-destructive/80 hover:text-destructive underline-offset-2 hover:underline transition-colors"
          >
            {group.label}
          </button>
          <ul className="mt-1 mr-4 list-disc list-inside text-sm text-muted-foreground space-y-0.5">
            {group.messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

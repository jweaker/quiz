import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EpisodeSettings } from '@/lib/episodeSchema'

export interface MetadataProps {
  metadata: {
    title: string
    date: string
    teamNames: { left: string; right: string }
    settings: EpisodeSettings
  }
  onChange: (update: MetadataProps['metadata']) => void
  errors: Record<string, string[]>
}

const settingsLabels: Record<keyof EpisodeSettings, string> = {
  puzzleDuration: 'مدة الألغاز (ثانية)',
  debateDuration: 'مدة النقاش (ثانية)',
  rapidQuestionsDuration: 'مدة الرشق السريع (ثانية)',
  poeticChaseDuration: 'مدة المطاردة الشعرية (ثانية)',
  askIntelligentlyDuration: 'مدة اسأل بذكاء (ثانية)',
}

function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  const msgs = errors[field]
  if (!msgs || msgs.length === 0) return null
  return (
    <div className="text-sm text-destructive mt-1">
      {msgs.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  )
}

export default function MetadataSection({ metadata, onChange, errors }: MetadataProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const update = (partial: Partial<MetadataProps['metadata']>) => {
    onChange({ ...metadata, ...partial })
  }

  const updateTeam = (side: 'left' | 'right', value: string) => {
    update({ teamNames: { ...metadata.teamNames, [side]: value } })
  }

  const updateSetting = (key: keyof EpisodeSettings, value: number) => {
    update({ settings: { ...metadata.settings, [key]: value } })
  }

  return (
    <div id="section-metadata" className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">بيانات الحلقة</h2>

      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="ep-title">عنوان الحلقة</Label>
        <Input
          id="ep-title"
          value={metadata.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="اختياري"
        />
        <FieldError errors={errors} field="title" />
      </div>

      {/* Team names */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="left-team">الفريق الأيسر *</Label>
          <Input
            id="left-team"
            value={metadata.teamNames.left}
            onChange={(e) => updateTeam('left', e.target.value)}
            placeholder="اسم الفريق"
            aria-invalid={!!errors.leftTeamName}
          />
          <FieldError errors={errors} field="leftTeamName" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="right-team">الفريق الأيمن *</Label>
          <Input
            id="right-team"
            value={metadata.teamNames.right}
            onChange={(e) => updateTeam('right', e.target.value)}
            placeholder="اسم الفريق"
            aria-invalid={!!errors.rightTeamName}
          />
          <FieldError errors={errors} field="rightTeamName" />
        </div>
      </div>

      {/* Date */}
      <div className="space-y-1">
        <Label htmlFor="ep-date">التاريخ</Label>
        <Input
          id="ep-date"
          type="date"
          value={metadata.date}
          onChange={(e) => update({ date: e.target.value })}
        />
        <FieldError errors={errors} field="date" />
      </div>

      {/* Settings (collapsible) */}
      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className={`transition-transform ${settingsOpen ? 'rotate-90' : ''}`}>
            ◀
          </span>
          إعدادات المدد
        </button>

        {settingsOpen && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            {(Object.keys(settingsLabels) as (keyof EpisodeSettings)[]).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`setting-${key}`}>{settingsLabels[key]}</Label>
                <Input
                  id={`setting-${key}`}
                  type="number"
                  min={1}
                  value={metadata.settings[key]}
                  onChange={(e) => updateSetting(key, Number(e.target.value) || 1)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

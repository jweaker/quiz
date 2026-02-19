import { useState, useCallback, useRef, useEffect } from 'react'
import type { Episode, EpisodeParts, EpisodeSettings } from '@/lib/episodeSchema'
import {
  createBlankEpisode,
  createTemplateEpisode,
  validateEpisode,
} from '@/lib/episodeSchema'
import EditorHeader from './components/EditorHeader'
import MetadataSection from './components/MetadataSection'
import ValidationSummary from './components/ValidationSummary'
import SpeedQuestionsForm from './components/SpeedQuestionsForm'
import WindowsForm from './components/WindowsForm'
import PuzzleForm from './components/PuzzleForm'
import DebateForm from './components/DebateForm'
import RapidQuestionsForm from './components/RapidQuestionsForm'
import AudienceQuestionsForm from './components/AudienceQuestionsForm'

type EditorErrors = Record<string, string[]>

export interface MetadataUpdate {
  title: string
  date: string
  teamNames: { left: string; right: string }
  settings: EpisodeSettings
}

export default function EpisodeEditor() {
  const [episode, setEpisode] = useState<Episode>(createBlankEpisode)
  const [errors, setErrors] = useState<EditorErrors>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced validation — fires 300ms after last change
  const runValidation = useCallback((ep: Episode) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const result = validateEpisode(ep)
      setErrors(result.errors ?? {})
    }, 300)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Episode updater that triggers validation
  const updateEpisode = useCallback(
    (updater: (prev: Episode) => Episode) => {
      setEpisode((prev) => {
        const next = updater(prev)
        runValidation(next)
        return next
      })
    },
    [runValidation]
  )

  // Helper to update a single parts key (used by section forms)
  const updateParts = useCallback(
    <K extends keyof EpisodeParts>(key: K, value: EpisodeParts[K]) => {
      updateEpisode((prev) => ({
        ...prev,
        parts: { ...prev.parts, [key]: value },
      }))
    },
    [updateEpisode]
  )

  // ─── Import / Export / New handlers ─────────────────────────────

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string)
          const result = validateEpisode(json)
          if (result.success && result.data) {
            setEpisode(result.data)
            setErrors({})
          } else {
            setErrors(result.errors ?? { _form: ['ملف غير صالح'] })
          }
        } catch {
          setErrors({ _form: ['خطأ في قراءة الملف — تأكد أنه JSON صالح'] })
        }
      }
      reader.readAsText(file)
    },
    []
  )

  const handleExport = useCallback(() => {
    const json = JSON.stringify(episode, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${episode.title || 'episode'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [episode])

  const handleNew = useCallback(
    (type: 'blank' | 'template' | 'clone') => {
      if (type === 'blank') {
        const blank = createBlankEpisode()
        setEpisode(blank)
        runValidation(blank)
      } else if (type === 'template') {
        const template = createTemplateEpisode()
        setEpisode(template)
        runValidation(template)
      } else {
        // clone — open file picker
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) handleImport(file)
        }
        input.click()
      }
    },
    [handleImport, runValidation]
  )

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <EditorHeader
          title={episode.title ?? ''}
          onTitleChange={(title: string) => updateEpisode((prev) => ({ ...prev, title }))}
          onNew={handleNew}
          onImport={handleImport}
          onExport={handleExport}
        />

        <MetadataSection
          metadata={{
            title: episode.title ?? '',
            date: episode.date ?? '',
            teamNames: {
              left: episode.leftTeamName,
              right: episode.rightTeamName,
            },
            settings: episode.settings ?? {
              puzzleDuration: 90,
              debateDuration: 60,
              rapidQuestionsDuration: 60,
              poeticChaseDuration: 100,
              askIntelligentlyDuration: 120,
            },
          }}
          onChange={(update: MetadataUpdate) => {
            updateEpisode((prev) => ({
              ...prev,
              title: update.title,
              date: update.date,
              leftTeamName: update.teamNames.left,
              rightTeamName: update.teamNames.right,
              settings: update.settings,
            }))
          }}
          errors={errors}
        />

        {/* Section forms — Speed, Windows, Puzzle */}
        <SpeedQuestionsForm
          questions={episode.parts.speedQuestions}
          onChange={(q) => updateParts('speedQuestions', q)}
          errors={errors}
        />

        <WindowsForm
          windows={episode.parts.windows}
          onChange={(w) => updateParts('windows', w)}
          errors={errors}
        />

        <PuzzleForm
          puzzles={episode.parts.puzzles}
          onChange={(p) => updateParts('puzzles', p)}
          puzzleDuration={episode.settings?.puzzleDuration ?? 90}
          onDurationChange={(d) =>
            updateEpisode((prev) => ({
              ...prev,
              settings: { ...prev.settings!, puzzleDuration: d },
            }))
          }
          errors={errors}
        />

        {/* Debate section — single question */}
        <DebateForm
          debate={episode.parts.debate}
          onChange={(d) => updateParts('debate', d)}
          debateDuration={episode.settings?.debateDuration ?? 60}
          onDurationChange={(d) =>
            updateEpisode((prev) => ({
              ...prev,
              settings: { ...prev.settings!, debateDuration: d },
            }))
          }
          errors={errors}
        />

        {/* Rapid questions section */}
        <RapidQuestionsForm
          quickQuestions={episode.parts.quickQuestions}
          onChange={(q) => updateParts('quickQuestions', q)}
          errors={errors}
        />

        {/* Audience questions section */}
        <AudienceQuestionsForm
          questions={episode.parts.audienceQuestions}
          onChange={(q) => updateParts('audienceQuestions', q)}
          errors={errors}
        />

        <ValidationSummary errors={errors} />
      </div>
    </div>
  )
}

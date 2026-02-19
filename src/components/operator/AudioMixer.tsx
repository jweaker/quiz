import { useOperatorStore } from '@/state/operatorStore'
import { audioManager, type AudioCategory } from '@/lib/audioManager'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Volume2, VolumeX } from 'lucide-react'

/** Category definition with Arabic labels and associated sounds */
interface CategoryDef {
  key: AudioCategory
  label: string
  volumeKey: 'timerVolume' | 'feedbackVolume' | 'transitionVolume' | 'sectionVolume'
  setVolume: 'setTimerVolume' | 'setFeedbackVolume' | 'setTransitionVolume' | 'setSectionVolume'
  sounds: Array<{ id: string; label: string }>
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'timer',
    label: 'المؤقتات',
    volumeKey: 'timerVolume',
    setVolume: 'setTimerVolume',
    sounds: [
      { id: 'tick', label: 'نقرة' },
      { id: 'timer-warning', label: 'تحذير' },
      { id: 'timer-urgent', label: 'عاجل' },
      { id: 'timer-expire', label: 'انتهاء' },
    ],
  },
  {
    key: 'feedback',
    label: 'ردود الفعل',
    volumeKey: 'feedbackVolume',
    setVolume: 'setFeedbackVolume',
    sounds: [
      { id: 'correct', label: 'صحيح' },
      { id: 'wrong', label: 'خطأ' },
      { id: 'score-milestone', label: 'إنجاز' },
    ],
  },
  {
    key: 'transition',
    label: 'الانتقالات',
    volumeKey: 'transitionVolume',
    setVolume: 'setTransitionVolume',
    sounds: [
      { id: 'section-enter', label: 'دخول' },
      { id: 'section-exit', label: 'خروج' },
      { id: 'show-intro', label: 'افتتاحية' },
      { id: 'show-outro', label: 'ختامية' },
    ],
  },
  {
    key: 'section',
    label: 'الأقسام',
    volumeKey: 'sectionVolume',
    setVolume: 'setSectionVolume',
    sounds: [
      { id: 'minefield-danger', label: 'خطر الألغام' },
      { id: 'minefield-correct', label: 'ألغام صحيح' },
      { id: 'minefield-wrong', label: 'ألغام خطأ' },
      { id: 'debate-reveal', label: 'كشف المناظرة' },
      { id: 'puzzle-solve', label: 'حل اللغز' },
      { id: 'thinking-loop', label: 'تفكير' },
      { id: 'pass-verse', label: 'تمرير البيت' },
    ],
  },
]

/**
 * Audio Mixer panel for the operator adaptive zone.
 *
 * Features:
 * - Master volume slider + mute toggle
 * - Per-category volume sliders (timer, feedback, transition, section)
 * - Per-sound preview buttons
 * - Compact mission-control density
 */
export function AudioMixer() {
  const masterVolume = useOperatorStore((s) => s.masterVolume)
  const audioMuted = useOperatorStore((s) => s.audioMuted)
  const setMasterVolume = useOperatorStore((s) => s.setMasterVolume)
  const setAudioMuted = useOperatorStore((s) => s.setAudioMuted)

  const handleMasterVolumeChange = (value: number[]) => {
    const vol = (value[0] ?? 0) / 100
    setMasterVolume(vol)
    audioManager.setMasterVolume(vol)
    if (vol > 0 && audioMuted) {
      setAudioMuted(false)
    }
  }

  const handleMasterMuteToggle = () => {
    audioManager.toggleMute()
    setAudioMuted(audioManager.isMuted)
  }

  const handlePreview = (soundId: string) => {
    audioManager.play(soundId)
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Master volume */}
      <div className="rounded border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={handleMasterMuteToggle}
          >
            {audioMuted ? (
              <VolumeX className="size-3.5 text-destructive" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </Button>
          <span className="text-xs font-medium flex-1">الصوت الرئيسي</span>
          <span className="text-[10px] text-muted-foreground tabular-nums western-numerals w-8 text-left">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
        <Slider
          value={[Math.round(masterVolume * 100)]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleMasterVolumeChange}
          className="w-full"
        />
      </div>

      {/* Per-category sections */}
      {CATEGORIES.map((cat) => (
        <CategorySection
          key={cat.key}
          category={cat}
          onPreview={handlePreview}
        />
      ))}
    </div>
  )
}

/** Individual category section with volume slider and sound previews */
function CategorySection({
  category,
  onPreview,
}: {
  category: CategoryDef
  onPreview: (soundId: string) => void
}) {
  const volume = useOperatorStore((s) => s[category.volumeKey])
  const setVolume = useOperatorStore((s) => s[category.setVolume])

  const handleVolumeChange = (value: number[]) => {
    const vol = (value[0] ?? 0) / 100
    setVolume(vol)
    audioManager.setCategoryVolume(category.key, vol)
  }

  return (
    <div className="rounded border border-border bg-card px-3 py-2">
      {/* Category header with slider */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium flex-1">{category.label}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums western-numerals w-8 text-left">
          {Math.round(volume * 100)}%
        </span>
      </div>
      <Slider
        value={[Math.round(volume * 100)]}
        min={0}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        className="w-full mb-1.5"
      />

      {/* Sound preview buttons */}
      <div className="flex flex-wrap gap-1">
        {category.sounds.map((sound) => (
          <Button
            key={sound.id}
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] gap-0.5"
            onClick={() => onPreview(sound.id)}
          >
            <Play className="size-2.5 fill-current" />
            {sound.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

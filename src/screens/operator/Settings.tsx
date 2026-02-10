import { useOperatorStore } from '@/state'
import type { SafeArea } from '@/state'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const EDGES = [
  { key: 'top' as const, label: 'أعلى', labelEn: 'Top' },
  { key: 'right' as const, label: 'يمين', labelEn: 'Right' },
  { key: 'bottom' as const, label: 'أسفل', labelEn: 'Bottom' },
  { key: 'left' as const, label: 'يسار', labelEn: 'Left' },
] as const

/**
 * Settings page for configuring safe area margins.
 * Four number inputs with optional slider (percentage mode).
 * All changes save immediately to operatorStore — no submit button needed.
 */
export function Settings() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const setSafeArea = useOperatorStore((s) => s.setSafeArea)
  const navigate = useNavigate()

  const isPercent = safeArea.unit === '%'

  function updateEdge(edge: keyof Omit<SafeArea, 'unit'>, value: number) {
    const clamped = isPercent
      ? Math.min(50, Math.max(0, value))
      : Math.max(0, value)
    setSafeArea({ ...safeArea, [edge]: clamped })
  }

  function toggleUnit() {
    const newUnit = isPercent ? 'px' : '%'
    // Reset values when switching units to avoid nonsensical values
    setSafeArea({
      top: 0,
      right: 0,
      bottom: newUnit === '%' ? 15 : 0,
      left: 0,
      unit: newUnit,
    })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/operator')}
        >
          <ArrowRight className="size-4" />
          <span className="sr-only">رجوع</span>
        </Button>
        <h1 className="text-lg font-bold">الإعدادات</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Section: Safe Area */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold">المنطقة الآمنة</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  هوامش المحتوى على شاشة الجمهور
                </p>
              </div>

              {/* Unit toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
                  px
                </Label>
                <Switch
                  id="unit-toggle"
                  checked={isPercent}
                  onCheckedChange={toggleUnit}
                />
                <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
                  %
                </Label>
              </div>
            </div>

            {/* Margin inputs */}
            <div className="grid grid-cols-2 gap-6">
              {EDGES.map(({ key, label, labelEn }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`margin-${key}`}>
                    {label}
                    <span className="text-muted-foreground text-xs ms-1">
                      ({labelEn})
                    </span>
                  </Label>

                  <div className="flex items-center gap-3">
                    <Input
                      id={`margin-${key}`}
                      type="number"
                      min={0}
                      max={isPercent ? 50 : undefined}
                      step={isPercent ? 1 : 10}
                      value={safeArea[key]}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value)
                        if (!Number.isNaN(parsed)) {
                          updateEdge(key, parsed)
                        }
                      }}
                      className="w-24 tabular-nums"
                    />
                    <span className="text-sm text-muted-foreground w-6">
                      {safeArea.unit}
                    </span>
                  </div>

                  {/* Slider for percentage mode */}
                  {isPercent && (
                    <Slider
                      value={[safeArea[key]]}
                      onValueChange={(values) => {
                        if (values[0] !== undefined) updateEdge(key, values[0])
                      }}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Live preview */}
          <section>
            <h2 className="text-base font-semibold mb-3">معاينة</h2>
            <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {/* Safe area visualization */}
              <div
                className="absolute bg-primary/10 border-2 border-dashed border-primary/30 rounded transition-all"
                style={{
                  top: isPercent ? `${safeArea.top}%` : `${(safeArea.top / 2160) * 100}%`,
                  right: isPercent ? `${safeArea.right}%` : `${(safeArea.right / 3840) * 100}%`,
                  bottom: isPercent ? `${safeArea.bottom}%` : `${(safeArea.bottom / 2160) * 100}%`,
                  left: isPercent ? `${safeArea.left}%` : `${(safeArea.left / 3840) * 100}%`,
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    محتوى آمن
                  </span>
                </div>
              </div>

              {/* Corner labels */}
              <div className="absolute top-1 start-1 text-[10px] text-muted-foreground/60 font-mono">
                {safeArea.top}{safeArea.unit}
              </div>
              <div className="absolute bottom-1 start-1 text-[10px] text-muted-foreground/60 font-mono">
                {safeArea.bottom}{safeArea.unit}
              </div>
              <div className="absolute top-1 end-1 text-[10px] text-muted-foreground/60 font-mono">
                {safeArea.left}{safeArea.unit}
              </div>
              <div className="absolute bottom-1 end-1 text-[10px] text-muted-foreground/60 font-mono">
                {safeArea.right}{safeArea.unit}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              الخط المتقطع يمثل حدود المنطقة الآمنة
            </p>
          </section>

          {/* Current values summary */}
          <section className="rounded-lg border p-4 bg-card">
            <h3 className="text-sm font-medium mb-2">القيم الحالية</h3>
            <p className="text-sm text-muted-foreground font-mono" dir="ltr">
              top: {safeArea.top}{safeArea.unit}, right: {safeArea.right}{safeArea.unit}, bottom: {safeArea.bottom}{safeArea.unit}, left: {safeArea.left}{safeArea.unit}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Settings

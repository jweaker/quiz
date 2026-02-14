import { useTimerStore } from '@/state'

/**
 * Large letter overlay for audience broadcast display.
 * Shows the required letter for Poetic Chase verse requirements.
 * Latin letters (A-Z) represent the Arabic letter that the verse must start with.
 */
export function LetterDisplay() {
  const requiredLetter = useTimerStore((s) => s.requiredLetter)

  // Don't render anything if no letter is set
  if (!requiredLetter) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{
        // Semi-transparent dark backdrop for contrast
        background: 'radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
      }}
    >
      <div
        className="text-white font-bold western-numerals select-none"
        style={{
          fontSize: 'clamp(8rem, 15vw, 20rem)',
          textShadow: `
            0 0 20px rgba(255,255,255,0.5),
            0 0 40px rgba(255,255,255,0.3),
            0 4px 8px rgba(0,0,0,0.5)
          `,
        }}
      >
        {requiredLetter}
      </div>
    </div>
  )
}

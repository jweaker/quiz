import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore } from '@/state'

/**
 * Keyboard hook for displaying required letter on audience screen.
 * Used during Poetic Chase section to show which Arabic letter the next verse must start with.
 * Operator presses any A-Z key to display that letter, Escape to clear.
 */
export function useLetterDisplay() {
  const setRequiredLetter = useTimerStore((s) => s.setRequiredLetter)

  // Register all 26 letter keys (a-z)
  // When pressed, display the uppercase letter on audience screen
  useHotkeys(
    'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
    (e) => {
      setRequiredLetter(e.key.toUpperCase())
    },
    { enableOnFormTags: false, preventDefault: true }
  )

  // Escape clears the letter display
  useHotkeys(
    'escape',
    () => {
      setRequiredLetter(null)
    },
    { enableOnFormTags: false, preventDefault: true }
  )
}

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { broadcast } from './sync/broadcastMiddleware'

export interface TimerState {
  // General countdown
  countdownRemaining: number      // seconds remaining
  countdownRunning: boolean
  countdownDuration: number       // total duration in seconds

  // Chess clock (Poetic Chase)
  rightTimeMs: number             // right team remaining (ms)
  leftTimeMs: number              // left team remaining (ms)
  activeTimer: 'right' | 'left' | null  // which clock is ticking

  // Poetic Chase
  requiredLetter: string | null   // letter displayed on audience screen
  verseCount: { right: number; left: number }  // verse points per team

  // Actions
  setCountdown: (duration: number) => void
  setCountdownRemaining: (remaining: number) => void
  setCountdownRunning: (running: boolean) => void
  setActiveTimer: (active: 'right' | 'left' | null) => void
  setRightTimeMs: (ms: number) => void
  setLeftTimeMs: (ms: number) => void
  setRequiredLetter: (letter: string | null) => void
  addVerse: (team: 'right' | 'left') => void
  resetChessClock: (durationMs?: number) => void
  resetTimer: () => void
}

const initialState = {
  countdownRemaining: 0,
  countdownRunning: false,
  countdownDuration: 0,
  rightTimeMs: 100_000,
  leftTimeMs: 100_000,
  activeTimer: null as 'right' | 'left' | null,
  requiredLetter: null as string | null,
  verseCount: { right: 0, left: 0 },
}

export const useTimerStore = create<TimerState>()(
  broadcast(
    persist(
      (set) => ({
        ...initialState,

        setCountdown: (duration) => set({ countdownDuration: duration, countdownRemaining: duration }),
        setCountdownRemaining: (remaining) => set({ countdownRemaining: remaining }),
        setCountdownRunning: (running) => set({ countdownRunning: running }),
        setActiveTimer: (active) => set({ activeTimer: active }),
        setRightTimeMs: (ms) => set({ rightTimeMs: ms }),
        setLeftTimeMs: (ms) => set({ leftTimeMs: ms }),
        setRequiredLetter: (letter) => set({ requiredLetter: letter }),
        addVerse: (team) => set((state) => ({
          verseCount: {
            ...state.verseCount,
            [team]: state.verseCount[team] + 1,
          },
        })),
        resetChessClock: (durationMs = 100_000) => set({
          rightTimeMs: durationMs,
          leftTimeMs: durationMs,
          activeTimer: null,
          verseCount: { right: 0, left: 0 },
          requiredLetter: null,
        }),
        resetTimer: () => set({
          countdownRemaining: 0,
          countdownRunning: false,
          countdownDuration: 0,
        }),
      }),
      {
        name: 'timer-storage', // localStorage key (different from show-storage)
        storage: createJSONStorage(() => localStorage),
        partialize: () => {
          // Timer/chess-clock values are runtime-only and should never survive reloads.
          // Persisting them causes stale timers to appear at incorrect moments.
          return {}
        },
      }
    ),
    'quiz-timer-state' // BroadcastChannel name (different from quiz-show-state)
  )
)

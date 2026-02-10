import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Question data types (re-exported from contexts for backward compatibility)
interface QuestionItem {
  text: string
  answer: string
  duration: number
  marks: number
  file?: string
  isImage?: boolean
  done?: boolean
}

interface QuickQuestionSet {
  title: string
  questions: QuestionItem[]
}

interface WindowsData {
  naturalSciences: QuestionItem[]
  humanSciences: QuestionItem[]
  misc: QuestionItem[]
  arts: QuestionItem[]
  religion: QuestionItem[]
  [key: string]: QuestionItem[]
}

interface EpisodeParts {
  speedQuestions: QuestionItem[]
  debate: QuestionItem
  puzzles: QuestionItem[]
  windows: WindowsData
  audienceQuestions: QuestionItem[]
  quickQuestions: QuickQuestionSet[]
  [key: string]: unknown
}

export interface EpisodeData {
  leftTeamName: string
  rightTeamName: string
  parts: EpisodeParts
  [key: string]: unknown
}

export interface ShowState {
  // Scores
  rightScore: number
  leftScore: number

  // Turn state
  rightsTurn: boolean
  turned: boolean

  // Question tracking
  quickQuestion: number
  audienceQuestion: number

  // Episode data
  data: EpisodeData | null

  // Actions
  setRightScore: (score: number) => void
  setLeftScore: (score: number) => void
  addRightScore: (delta: number) => void
  addLeftScore: (delta: number) => void
  setRightsTurn: (isRight: boolean) => void
  toggleTurn: () => void
  setTurned: (turned: boolean) => void
  setQuickQuestion: (index: number) => void
  setAudienceQuestion: (index: number) => void
  setData: (data: EpisodeData) => void
  updateData: (updater: (data: EpisodeData) => EpisodeData) => void
  reset: () => void
}

const initialState = {
  rightScore: 0,
  leftScore: 0,
  rightsTurn: false,
  turned: false,
  quickQuestion: 0,
  audienceQuestion: 0,
  data: null as EpisodeData | null,
}

export const useShowStore = create<ShowState>()(
  persist(
    (set) => ({
      ...initialState,

      setRightScore: (score) => set({ rightScore: score }),
      setLeftScore: (score) => set({ leftScore: score }),
      addRightScore: (delta) => set((state) => ({ rightScore: state.rightScore + delta })),
      addLeftScore: (delta) => set((state) => ({ leftScore: state.leftScore + delta })),
      setRightsTurn: (isRight) => set({ rightsTurn: isRight }),
      toggleTurn: () => set((state) => ({ rightsTurn: !state.rightsTurn, turned: true })),
      setTurned: (turned) => set({ turned }),
      setQuickQuestion: (index) => set({ quickQuestion: index }),
      setAudienceQuestion: (index) => set({ audienceQuestion: index }),
      setData: (data) => set({ data }),
      updateData: (updater) =>
        set((state) => {
          if (!state.data) return state
          return { data: updater(state.data) }
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'show-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)

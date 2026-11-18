export const initialProgression = {
  triedLine: false,
  revealedLine: false,
  selectedXorFeature: false,
  checkedXor: false,
  triedSpiral: false,
  checkedSpiral: false,
  unlockedThrough: 1,
  conclusionUnlocked: false,
  scrollRequest: undefined as { id: string } | undefined,
}

export type Progression = typeof initialProgression
export type ProgressionAction =
  | 'try-line' | 'reveal-line' | 'continue-to-lifting'
  | 'select-xor-feature' | 'check-xor' | 'continue-to-limitations'
  | 'try-spiral' | 'check-spiral' | 'reveal-conclusion'

export function progressStory(state: Progression, action: ProgressionAction): Progression {
  switch (action) {
    case 'try-line':
      return state.triedLine ? state : { ...state, triedLine: true }
    case 'reveal-line':
      return state.triedLine ? { ...state, revealedLine: true } : state
    case 'continue-to-lifting':
      return state.revealedLine
        ? { ...state, unlockedThrough: Math.max(state.unlockedThrough, 4), scrollRequest: { id: 'chapter-2' } }
        : state
    case 'select-xor-feature':
      return state.unlockedThrough >= 4 && !state.selectedXorFeature ? { ...state, selectedXorFeature: true } : state
    case 'check-xor':
      return state.selectedXorFeature && !state.checkedXor ? { ...state, checkedXor: true } : state
    case 'continue-to-limitations':
      return state.checkedXor ? { ...state, unlockedThrough: 5, scrollRequest: { id: 'chapter-5' } } : state
    case 'try-spiral':
      return state.unlockedThrough === 5 && !state.triedSpiral ? { ...state, triedSpiral: true } : state
    case 'check-spiral':
      return state.triedSpiral && !state.checkedSpiral ? { ...state, checkedSpiral: true } : state
    case 'reveal-conclusion':
      return state.checkedSpiral ? {
        ...state, conclusionUnlocked: true, scrollRequest: { id: 'explainer-conclusion-heading' },
      } : state
  }
}

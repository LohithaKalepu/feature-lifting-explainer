import { plotThemeVariables } from '../components/classColors'
import { useEffect, useReducer, type CSSProperties } from 'react'
import { Chapter1 } from '../chapters/Chapter1'
import { Chapter2 } from '../chapters/Chapter2'
import { Chapter3 } from '../chapters/Chapter3'
import { Chapter4 } from '../chapters/Chapter4'
import { Chapter5 } from '../chapters/Chapter5'
import { initialProgression, progressStory } from './progression'

export default function App() {
  const [progression, dispatch] = useReducer(progressStory, initialProgression)
  const { unlockedThrough, scrollRequest } = progression

  useEffect(() => {
    if (!scrollRequest) return
    const destination = document.getElementById(scrollRequest.id)
    destination?.focus({ preventScroll: true })
    destination?.scrollIntoView({ block: 'start' })
  }, [scrollRequest])

  return <div className="app" style={plotThemeVariables as CSSProperties}>
    <header className="story-introduction">
      <h1>Feature Lifting</h1>
      <p className="introduction-subtitle">When straight lines become curves.</p>
      <p>Linear classifiers divide data using straight boundaries. But what happens when the patterns we're trying to separate aren't so simple?</p>
      <p>Let's start with a challenge.</p>
      <a className="introduction-link" href="#chapter-one-challenge">Begin Exploring</a>
    </header>
    <main className="story">
      <Chapter1 />
      <Chapter2 />
      <Chapter3 />
      <Chapter4 onSelectFeature={() => dispatch('select-xor-feature')}
        onCheck={() => dispatch('check-xor')}
        onContinue={progression.checkedXor ? () => dispatch('continue-to-limitations') : undefined} />
      {unlockedThrough >= 5 && <Chapter5 onInteract={() => dispatch('try-spiral')}
        onCheck={() => dispatch('check-spiral')} conclusionUnlocked={progression.conclusionUnlocked}
        onRevealConclusion={progression.checkedSpiral ? () => dispatch('reveal-conclusion') : undefined} />}
    </main>
  </div>
}

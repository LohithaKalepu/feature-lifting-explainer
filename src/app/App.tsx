import { useEffect, useReducer, useRef, useState } from 'react'
import { Chapter1 } from '../chapters/Chapter1'
import { Chapter2 } from '../chapters/Chapter2'
import { Chapter3 } from '../chapters/Chapter3'
import { Chapter4 } from '../chapters/Chapter4'
import { Chapter5 } from '../chapters/Chapter5'
import { initialProgression, progressStory } from './progression'

const chapters = [
  { id: 'chapter-1', title: 'The Problem' },
  { id: 'chapter-2', title: 'Feature Lifting' },
  { id: 'chapter-3', title: 'The Linear Model' },
  { id: 'chapter-4', title: 'Apply Your Understanding' },
  { id: 'chapter-5', title: 'Limitations' },
]

export default function App() {
  const [progression, dispatch] = useReducer(progressStory, initialProgression)
  const { unlockedThrough, scrollRequest } = progression
  const [activeChapter, setActiveChapter] = useState(chapters[0].id)
  const navigation = useRef<HTMLElement>(null)

  useEffect(() => {
    const sections = chapters.flatMap(({ id }) => {
      const section = document.getElementById(id)
      return section ? [section] : []
    })
    let observer: IntersectionObserver | undefined

    function observeReadingLine() {
      observer?.disconnect()
      const headerHeight = navigation.current?.offsetHeight ?? 0
      const line = Math.min(window.innerHeight - 1, headerHeight + 16)
      observer = new IntersectionObserver(() => {
        const visible = sections.find(section => {
          const { bottom } = section.getBoundingClientRect()
          return bottom > line
        })
        if (visible) setActiveChapter(visible.id)
      }, { rootMargin: `-${line}px 0px -${window.innerHeight - line - 1}px 0px` })
      sections.forEach(section => observer?.observe(section))
    }

    observeReadingLine()
    window.addEventListener('resize', observeReadingLine)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', observeReadingLine)
    }
  }, [unlockedThrough])

  useEffect(() => {
    if (!scrollRequest) return
    const destination = document.getElementById(scrollRequest.id)
    destination?.focus({ preventScroll: true })
    destination?.scrollIntoView({ block: 'start' })
  }, [scrollRequest])

  return <div className="app">
    <header>
      <h1>Feature Lifting</h1>
      <p>How Linear Models Create Nonlinear Boundaries</p>
    </header>
    <nav className="chapter-nav" aria-label="Chapter progress" ref={navigation}>
      {chapters.map(({ id, title }, index) => {
        const number = index + 1
        const label = `Chapter ${number} — ${title}`
        const marker = <>{number}<span className="chapter-nav-title">. {title}</span></>
        return number <= unlockedThrough
          ? <a key={id} href={`#${id}`} aria-label={label}
              aria-current={activeChapter === id ? 'location' : undefined}>{marker}</a>
          : <span key={id} className="chapter-locked" role="link" aria-disabled="true" aria-label={`${label} (locked)`}>
              {marker}<span aria-hidden="true"> 🔒</span>
            </span>
      })}
    </nav>
    <main className="story">
      <Chapter1 experimented={progression.triedLine} revealed={progression.revealedLine}
        onExperiment={() => dispatch('try-line')} onReveal={() => dispatch('reveal-line')}
        onContinue={() => dispatch('continue-to-lifting')} />
      {unlockedThrough >= 2 && <Chapter2 />}
      {unlockedThrough >= 3 && <Chapter3 />}
      {unlockedThrough >= 4 && <Chapter4 onSelectFeature={() => dispatch('select-xor-feature')}
        onCheck={() => dispatch('check-xor')}
        onContinue={progression.checkedXor ? () => dispatch('continue-to-limitations') : undefined} />}
      {unlockedThrough >= 5 && <Chapter5 onInteract={() => dispatch('try-spiral')}
        onCheck={() => dispatch('check-spiral')} conclusionUnlocked={progression.conclusionUnlocked}
        onRevealConclusion={progression.checkedSpiral ? () => dispatch('reveal-conclusion') : undefined} />}
    </main>
  </div>
}

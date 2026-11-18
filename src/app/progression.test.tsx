import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'
import { Chapter1 } from '../chapters/Chapter1'
import { Chapter4 } from '../chapters/Chapter4'
import { Chapter5 } from '../chapters/Chapter5'
import { initialProgression, progressStory, type ProgressionAction } from './progression'

function follow(...actions: ProgressionAction[]) {
  return actions.reduce(progressStory, initialProgression)
}

const firstCheckpoint = ['try-line', 'reveal-line', 'continue-to-lifting'] as const
const xorCheckpoint = ['select-xor-feature', 'check-xor', 'continue-to-limitations'] as const
const noop = () => {}

describe('story checkpoints', () => {
  it('renders only Chapter 1 initially and makes locked markers non-navigable', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup.match(/href="#chapter-\d"/g)).toEqual(['href="#chapter-1"'])
    expect(markup.match(/role="link" aria-disabled="true"/g)).toHaveLength(4)
    expect(markup.match(/id="chapter-\d"/g)).toEqual(['id="chapter-1"'])
    expect(initialProgression.conclusionUnlocked).toBe(false)
  })

  it('requires a line interaction and a reveal before explicit Continue unlocks Chapters 2–4', () => {
    expect(follow('reveal-line', 'continue-to-lifting')).toBe(initialProgression)
    expect(follow('try-line', 'continue-to-lifting').unlockedThrough).toBe(1)
    const eligible = follow('try-line', 'reveal-line')
    expect(eligible.unlockedThrough).toBe(1)
    expect(eligible.scrollRequest).toBeUndefined()
    expect(follow(...firstCheckpoint)).toMatchObject({ unlockedThrough: 4, scrollRequest: { id: 'chapter-2' } })
  })

  it('requires an XOR selection followed by a check and only then allows Continue to Chapter 5', () => {
    expect(follow(...firstCheckpoint, 'check-xor', 'select-xor-feature', 'continue-to-limitations').unlockedThrough).toBe(4)
    const eligible = follow(...firstCheckpoint, 'select-xor-feature', 'check-xor')
    expect(eligible.unlockedThrough).toBe(4)
    expect(progressStory(eligible, 'continue-to-limitations')).toMatchObject({
      unlockedThrough: 5, scrollRequest: { id: 'chapter-5' },
    })
  })

  it('requires a spiral interaction followed by a check, then a separate conclusion reveal', () => {
    expect(follow(...firstCheckpoint, ...xorCheckpoint, 'check-spiral', 'try-spiral', 'reveal-conclusion')
      .conclusionUnlocked).toBe(false)
    const eligible = follow(...firstCheckpoint, ...xorCheckpoint, 'try-spiral', 'check-spiral')
    expect(eligible.conclusionUnlocked).toBe(false)
    expect(progressStory(eligible, 'reveal-conclusion')).toMatchObject({
      conclusionUnlocked: true, scrollRequest: { id: 'explainer-conclusion-heading' },
    })
  })

  it('retains all unlocks while returning to earlier checkpoints', () => {
    const completed = follow(...firstCheckpoint, ...xorCheckpoint, 'try-spiral', 'check-spiral', 'reveal-conclusion')
    const revisited = progressStory(completed, 'continue-to-lifting')
    expect(revisited).toMatchObject({
      unlockedThrough: 5, conclusionUnlocked: true, checkedXor: true, checkedSpiral: true,
      scrollRequest: { id: 'chapter-2' },
    })
    expect(progressStory(revisited, 'try-line')).toBe(revisited)
  })

  it('shows Continue controls at eligibility and keeps the audit visible before the conclusion', () => {
    const firstProps = { experimented: true, onExperiment: noop, onReveal: noop, onContinue: noop }
    expect(renderToStaticMarkup(<Chapter1 {...firstProps} revealed={false} />)).not.toContain('Continue to Feature Lifting')
    expect(renderToStaticMarkup(<Chapter1 {...firstProps} revealed />)).toContain('Continue to Feature Lifting')
    const fourthProps = { onSelectFeature: noop, onCheck: noop }
    expect(renderToStaticMarkup(<Chapter4 {...fourthProps} />)).not.toContain('Continue to Limitations')
    expect(renderToStaticMarkup(<Chapter4 {...fourthProps} onContinue={noop} />)).toContain('Continue to Limitations')
    const fifthProps = { onInteract: noop, onCheck: noop }
    const locked = renderToStaticMarkup(<Chapter5 {...fifthProps} conclusionUnlocked={false} />)
    expect(locked).toContain('Can Any Linear Plane Separate These Spirals?')
    expect(locked).not.toContain('What Did We Learn?')
    expect(locked).not.toContain('See What We Learned')
    const eligible = renderToStaticMarkup(<Chapter5 {...fifthProps} conclusionUnlocked={false} onRevealConclusion={noop} />)
    expect(eligible).toContain('See What We Learned')
    expect(eligible).not.toContain('What Did We Learn?')
    expect(renderToStaticMarkup(<Chapter5 {...fifthProps} conclusionUnlocked />)).toContain('What Did We Learn?')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'
import { Chapter4 } from '../chapters/Chapter4'
import { Chapter5 } from '../chapters/Chapter5'
import { initialProgression, progressStory, type ProgressionAction } from './progression'

function follow(...actions: ProgressionAction[]) {
  return actions.reduce(progressStory, initialProgression)
}

const xorCheckpoint = ['select-xor-feature', 'check-xor', 'continue-to-limitations'] as const
const noop = () => {}

describe('story checkpoints', () => {
  it('renders Chapters 1–4 initially and keeps Chapter 5 gated', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup).not.toContain('aria-label="Chapter progress"')
    expect(markup).not.toMatch(/href="#chapter-\d"/)
    expect(markup.match(/id="chapter-\d"/g)).toEqual(['id="chapter-1"', 'id="chapter-2"', 'id="chapter-3"', 'id="chapter-4"'])
    expect(initialProgression.conclusionUnlocked).toBe(false)
  })

  it('follows the challenge with the explanation and Chapter 2 without a reveal action', () => {
    const markup = renderToStaticMarkup(<App />)
    const challenge = markup.indexOf('Can a straight line separate')
    const explanation = markup.indexOf('Why a Line Falls Short')
    const transition = markup.indexOf('What if we looked at the same data differently?')
    expect(markup).toContain('When straight lines become curves.')
    expect(markup).toContain('href="#chapter-one-challenge">Begin Exploring')
    expect(challenge).toBeGreaterThan(markup.indexOf('Begin Exploring'))
    expect(explanation).toBeGreaterThan(challenge)
    expect(transition).toBeGreaterThan(explanation)
    expect(markup.indexOf('id="chapter-2"')).toBeGreaterThan(transition)
    expect(markup).not.toContain('Continue Exploring')
    expect(markup).not.toContain('Add Another Dimension')
  })

  it('requires an XOR selection followed by a check and only then allows Continue to Chapter 5', () => {
    expect(follow('check-xor', 'select-xor-feature', 'continue-to-limitations').unlockedThrough).toBe(4)
    const eligible = follow('select-xor-feature', 'check-xor')
    expect(eligible.unlockedThrough).toBe(4)
    expect(progressStory(eligible, 'continue-to-limitations')).toMatchObject({
      unlockedThrough: 5, scrollRequest: { id: 'chapter-5' },
    })
  })

  it('requires a spiral interaction followed by a check, then a separate conclusion reveal', () => {
    expect(follow(...xorCheckpoint, 'check-spiral', 'try-spiral', 'reveal-conclusion')
      .conclusionUnlocked).toBe(false)
    const eligible = follow(...xorCheckpoint, 'try-spiral', 'check-spiral')
    expect(eligible.conclusionUnlocked).toBe(false)
    expect(progressStory(eligible, 'reveal-conclusion')).toMatchObject({
      conclusionUnlocked: true, scrollRequest: { id: 'explainer-conclusion-heading' },
    })
  })

  it('retains all unlocks while returning to earlier checkpoints', () => {
    const completed = follow(...xorCheckpoint, 'try-spiral', 'check-spiral', 'reveal-conclusion')
    const revisited = progressStory(completed, 'check-xor')
    expect(revisited).toMatchObject({
      unlockedThrough: 5, conclusionUnlocked: true, checkedXor: true, checkedSpiral: true,
      scrollRequest: { id: 'explainer-conclusion-heading' },
    })
    expect(progressStory(revisited, 'select-xor-feature')).toBe(revisited)
  })

  it('shows Continue controls at eligibility and keeps the audit visible before the conclusion', () => {
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

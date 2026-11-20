import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('continuous story', () => {
  it('renders all five chapters initially without a chapter navigation bar', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup).not.toContain('aria-label="Chapter progress"')
    expect(markup).not.toMatch(/href="#chapter-\d"/)
    expect(markup.match(/id="chapter-\d"/g)).toEqual(['id="chapter-1"', 'id="chapter-2"', 'id="chapter-3"', 'id="chapter-4"', 'id="chapter-5"'])
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

  it('places Chapter 2’s feature and lifting controls before the plots', () => {
    const markup = renderToStaticMarkup(<App />)
    const chapter = markup.slice(markup.indexOf('id="chapter-2"'), markup.indexOf('id="chapter-3"'))
    const selector = chapter.indexOf('Choose a feature')
    const plots = chapter.indexOf('Original 2D dataset')
    expect(selector).toBeGreaterThan(chapter.indexOf('From two coordinates to three'))
    const lifting = chapter.indexOf('id="lifting-progress"')
    expect(lifting).toBeGreaterThan(selector)
    expect(plots).toBeGreaterThan(lifting)
    expect(chapter.slice(selector, plots)).toContain('All points lie on <strong>z = 0</strong>')
    expect(chapter).toMatch(/<button[^>]+aria-pressed="true">Original \(z = 0\)/)
  })

  it('puts the XOR explanation and transition before Chapter 5 without progression buttons', () => {
    const markup = renderToStaticMarkup(<App />)
    const xor = markup.indexOf('Exercise 2 — The XOR Challenge')
    const explanation = markup.indexOf('Why Does the Interaction Feature Work?')
    const handoff = markup.indexOf('Different patterns require different transformations.')
    const chapterFive = markup.indexOf('id="chapter-5"')
    expect(explanation).toBeGreaterThan(xor)
    expect(handoff).toBeGreaterThan(explanation)
    expect(chapterFive).toBeGreaterThan(handoff)
    expect(markup.slice(xor, chapterFive)).not.toMatch(/Check My Solution|Reveal Explanation|Continue to Limitations/)
  })

  it('renders the spiral investigation, results, and conclusion without progression controls', () => {
    const markup = renderToStaticMarkup(<App />)
    const chapter = markup.slice(markup.indexOf('id="chapter-5"'))
    const horizontalLimits = chapter.indexOf('Reach 100%?')
    const generalPlane = chapter.indexOf('But What If We Tilted the Plane?')
    const expressivity = chapter.indexOf('Why Not Keep Adding More Features?')
    const conclusion = chapter.indexOf('What Did We Learn?')
    expect(chapter).toContain('What Happens When Our Transformations')
    expect(chapter).toContain('>Reset</button>')
    expect(chapter).not.toMatch(/Check My Solution|See What We Learned|Reveal Conclusion/)
    expect(horizontalLimits).toBeGreaterThan(chapter.indexOf('Classification accuracy'))
    expect(generalPlane).toBeGreaterThan(horizontalLimits)
    expect(expressivity).toBeGreaterThan(generalPlane)
    expect(conclusion).toBeGreaterThan(expressivity)
  })
})

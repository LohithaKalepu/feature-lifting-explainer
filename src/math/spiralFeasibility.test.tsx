import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { spiralAuditInput } from '../../scripts/spiralAuditInput'
import { SpiralFeasibility } from '../chapters/SpiralFeasibility'
import { spiralDataset } from '../data/datasets'
import results from '../data/spiral_feasibility_results.json'
import { featureTransforms, type FeatureTransformId } from './featureTransforms'

describe('offline spiral feasibility audit', () => {
  it('matches the exact app observations and transformation heights by input digest', async () => {
    expect(spiralAuditInput.observations).toEqual(spiralDataset)
    expect(results.dataset.id).toBe(spiralAuditInput.datasetId)
    expect(results.dataset.observationCount).toBe(spiralDataset.length)
    for (const { id, heights } of spiralAuditInput.mappings) {
      expect(heights).toEqual(spiralDataset.map(point => featureTransforms[id].height(point.x1, point.x2)))
    }
    const input = new TextEncoder().encode(JSON.stringify(spiralAuditInput))
    const digest = await crypto.subtle.digest('SHA-256', input)
    const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
    expect(hex).toBe(results.dataset.inputSha256)
  })

  it('records HiGHS infeasibility for the original spirals and all three four-coefficient lifted models', () => {
    expect(results.solver.method).toBe('highs')
    expect(results.original2d).toMatchObject({ dimension: 2, statusCode: 2, outcome: 'infeasible' })
    expect(results.transformations.map(result => result.id)).toEqual(['linear', 'interaction', 'radial'])
    for (const result of results.transformations) {
      expect(result).toMatchObject({
        dimension: 3, coefficientOrder: ['w1', 'w2', 'w3', 'b'], statusCode: 2,
        outcome: 'infeasible', coefficients: null, minimumMargin: null,
      })
    }
  })

  it('records the known control outcomes and independently checks both feasible witnesses', () => {
    expect(results.controls.map(({ id, outcome, statusCode }) => [id, outcome, statusCode])).toEqual([
      ['separable-2d', 'feasible', 0],
      ['xor-2d', 'infeasible', 2],
      ['xor-interaction', 'feasible', 0],
    ])
    const controls = [
      { index: 0, rows: [[-2, 0, 1], [-1, 1, 1], [1, 0, 1], [2, 1, 1]], signs: [-1, -1, 1, 1] },
      { index: 2, rows: [[1, 1, 1, 1], [-1, 1, -1, 1], [-1, -1, 1, 1], [1, -1, -1, 1]], signs: [1, -1, 1, -1] },
    ]
    for (const { index, rows, signs } of controls) {
      const { coefficients, minimumMargin } = results.controls[index]
      expect(coefficients).toHaveLength(rows[0].length)
      const margins = rows.map((row, i) => signs[i] * row.reduce((sum, value, j) => sum + value * coefficients![j], 0))
      expect(Math.min(...margins)).toBeGreaterThanOrEqual(results.solver.requiredMargin - results.solver.validationTolerance)
      expect(Math.min(...margins)).toBeCloseTo(minimumMargin!, 12)
    }
  })

  it('renders each saved outcome beside its feature mapping', () => {
    const markup = renderToStaticMarkup(<SpiralFeasibility showConclusion />)
    const body = markup.match(/<tbody>(.*?)<\/tbody>/)?.[1] ?? ''
    const rows = [...body.matchAll(/<tr><th scope="row">(.*?)<\/th><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/g)]
    expect(rows.map(row => row.slice(1))).toEqual(results.transformations.map(({ id, outcome }) => {
      const { label, expression } = featureTransforms[id as FeatureTransformId]
      return [label, expression, outcome[0].toUpperCase() + outcome.slice(1)]
    }))
  })
})

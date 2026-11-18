import { describe, expect, it } from 'vitest'
import { createSpiralDataset, spiralDataset } from '../data/datasets'
import { bestHorizontalAccuracy, classificationSummary, horizontalPlaneScore, predictFromScore } from './featureClassifier'
import { featureTransforms, transformPoints } from './featureTransforms'
import type { DataPoint } from '../types'

const blue = spiralDataset.filter(point => point.label === 0)
const orange = spiralDataset.filter(point => point.label === 1)
const equations = {
  linear: (x1: number, x2: number) => x1 + x2,
  interaction: (x1: number, x2: number) => x1 * x2,
  radial: (x1: number, x2: number) => x1 * x1 + x2 * x2,
}

describe('intertwined spirals', () => {
  it('generates 144 deterministic and uniquely identified points, evenly divided between the arms', () => {
    expect(createSpiralDataset()).toEqual(spiralDataset)
    expect(blue).toHaveLength(72)
    expect(orange).toHaveLength(72)
    expect(new Set(spiralDataset.map(point => point.id)).size).toBe(144)
    expect(Math.max(...spiralDataset.map(point => Math.hypot(point.x1, point.x2)))).toBeLessThan(3)
  })

  it('winds each arm more than twice with increasing radius and distinct samples', () => {
    for (const arm of [blue, orange]) {
      let turn = 0
      for (let index = 1; index < arm.length; index++) {
        const previous = arm[index - 1]
        const current = arm[index]
        const angle = Math.atan2(
          previous.x1 * current.x2 - previous.x2 * current.x1,
          previous.x1 * current.x1 + previous.x2 * current.x2,
        )
        expect(angle).toBeCloseTo(Math.PI / 16, 12)
        expect(Math.hypot(current.x1, current.x2)).toBeGreaterThan(Math.hypot(previous.x1, previous.x2))
        turn += angle
      }
      expect(turn).toBeGreaterThan(4 * Math.PI)
    }

    const armGap = Math.min(...blue.flatMap(a => orange.map(b => Math.hypot(a.x1 - b.x1, a.x2 - b.x2))))
    expect(armGap).toBeGreaterThan(0.4)
  })

  it('rules out a straight separating line in 2D because the class hulls intersect', () => {
    // These two chords cross in their interiors. Each chord lies in its class's convex hull.
    const [a, b, c, d] = [blue[0], blue[16], orange[8], orange[24]]
    const side = (start: DataPoint, end: DataPoint, point: DataPoint) =>
      (end.x1 - start.x1) * (point.x2 - start.x2) - (end.x2 - start.x2) * (point.x1 - start.x1)
    expect(side(a, b, c) * side(a, b, d)).toBeLessThan(0)
    expect(side(c, d, a) * side(c, d, b)).toBeLessThan(0)
  })

  it.each(['linear', 'interaction', 'radial'] as const)(
    'preserves the original observations under %s and cannot perfectly classify them at any horizontal threshold',
    id => {
      const points = transformPoints(spiralDataset, featureTransforms[id].height)
      expect(points.map(({ z, ...point }) => {
        expect(z).toBeCloseTo(equations[id](point.x1, point.x2), 12)
        return point
      })).toEqual(spiralDataset)

      // For >=, each distinct observed height represents one attainable partition.
      // A threshold above the maximum adds the final all-Class-0 partition.
      const distinctHeights = [...new Set(points.map(point => point.z))]
      const thresholds = [...distinctHeights, Math.min(...distinctHeights) - 1, Math.max(...distinctHeights) + 1]
      const accuracies = thresholds.map(height => {
        const expected = points.map(point => point.z >= height ? 1 : 0)
        expect(points.map(point => predictFromScore(horizontalPlaneScore(point, height)))).toEqual(expected)
        const correct = points.filter((point, index) => point.label === expected[index]).length
        const accuracy = correct / points.length
        expect(classificationSummary(points, point => horizontalPlaneScore(point, height)))
          .toEqual({ correct, total: points.length, accuracy })
        return accuracy
      })
      const maximum = Math.max(...accuracies)
      expect(maximum).toBeLessThan(1)
      expect(bestHorizontalAccuracy(points)).toBe(maximum)
    },
  )
})

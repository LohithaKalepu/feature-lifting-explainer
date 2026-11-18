import { describe, expect, it } from 'vitest'
import { concentricDataset } from '../data/datasets'
import { horizontalPlanePosition, toWorldPosition } from './coordinates3D'
import { classificationSummary, horizontalPlaneScore, predictFromScore } from './featureClassifier'
import { featureTransforms, transformPoints } from './featureTransforms'

const points = transformPoints(concentricDataset, featureTransforms.radial.height)

describe('horizontal feature-space classifier', () => {
  it('uses the original observations and their full radial heights', () => {
    expect(points).toEqual(concentricDataset.map(point => ({
      ...point, z: point.x1 ** 2 + point.x2 ** 2,
    })))
  })

  it('predicts class 1 on the plane and changes predictions as the slider threshold passes a point', () => {
    const point = { z: 5 }
    expect([4.99, 5, 5.01].map(height => horizontalPlaneScore(point, height)))
      .toEqual([expect.closeTo(0.01), 0, expect.closeTo(-0.01)])
    expect([4.99, 5, 5.01].map(height => predictFromScore(horizontalPlaneScore(point, height))))
      .toEqual([1, 1, 0])
  })

  it('uses the actual labels and reaches perfect accuracy in the radial gap', () => {
    const inner = points.filter(point => point.label === 0)
    const outer = points.filter(point => point.label === 1)
    const innerMax = Math.max(...inner.map(point => point.z))
    const outerMin = Math.min(...outer.map(point => point.z))
    expect(innerMax).toBeLessThan(outerMin)
    expect(Math.min(...points.map(point => point.z))).toBeGreaterThan(0)
    expect(Math.max(...points.map(point => point.z))).toBeLessThan(7)

    const summaryAt = (height: number) => classificationSummary(points, point => horizontalPlaneScore(point, height))
    expect(summaryAt(0.4).accuracy).toBeLessThan(1)
    expect(summaryAt(0)).toEqual({ correct: outer.length, total: points.length, accuracy: outer.length / points.length })
    expect(summaryAt((innerMax + outerMin) / 2)).toEqual({ correct: points.length, total: points.length, accuracy: 1 })
    expect(summaryAt(7)).toEqual({ correct: inner.length, total: points.length, accuracy: inner.length / points.length })
  })

  it('places the plane on the same world height as points with zero score regardless of view orientation', () => {
    const height = 2.25
    const point = { x1: 1, x2: -1, z: height }
    const plane = horizontalPlanePosition(height)
    const worldPoint = toWorldPosition(point)
    expect(plane[1]).toBe(height)
    expect(worldPoint[1] - plane[1]).toBe(horizontalPlaneScore(point, height))

    // Rotate the view about world X. View-space Y no longer represents feature height.
    const angle = Math.PI / 4
    const viewY = ([, y, z]: [number, number, number]) => y * Math.cos(angle) - z * Math.sin(angle)
    expect(viewY(worldPoint)).not.toBeCloseTo(viewY(plane))
    expect(predictFromScore(horizontalPlaneScore(point, height))).toBe(1)
  })
})

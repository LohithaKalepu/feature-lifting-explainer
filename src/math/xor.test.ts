import { describe, expect, it } from 'vitest'
import { createXorDataset, xorDataset } from '../data/datasets'
import { bestHorizontalAccuracy, classificationSummary, horizontalPlaneScore, predictFromScore } from './featureClassifier'
import { featureTransforms, transformPoints } from './featureTransforms'

describe('XOR challenge', () => {
  it('generates 80 deterministic observations with unique IDs and 20 per quadrant', () => {
    expect(createXorDataset()).toEqual(xorDataset)
    expect(createXorDataset(413)).not.toEqual(xorDataset)
    expect(xorDataset).toHaveLength(80)
    expect(new Set(xorDataset.map(point => point.id)).size).toBe(80)
    for (const signX1 of [-1, 1]) {
      for (const signX2 of [-1, 1]) {
        expect(xorDataset.filter(point => Math.sign(point.x1) === signX1 && Math.sign(point.x2) === signX2))
          .toHaveLength(20)
      }
    }
  })

  it('labels by product sign and stays away from both axes', () => {
    for (const { x1, x2, label } of xorDataset) {
      expect(Math.min(Math.abs(x1), Math.abs(x2))).toBeGreaterThanOrEqual(0.7)
      expect(Math.max(Math.abs(x1), Math.abs(x2))).toBeLessThanOrEqual(2.2)
      expect(label).toBe(x1 * x2 > 0 ? 1 : 0)
    }
    expect(xorDataset.filter(point => point.label === 1)).toHaveLength(40)
  })

  it('perfectly separates the observations using interaction height at zero', () => {
    const points = transformPoints(xorDataset, featureTransforms.interaction.height)
    for (const point of points) {
      expect(point.z).toBe(point.x1 * point.x2)
      expect(Math.sign(point.z)).toBe(point.label === 1 ? 1 : -1)
    }
    expect(classificationSummary(points, point => horizontalPlaneScore(point, 0)))
      .toEqual({ correct: 80, total: 80, accuracy: 1 })
  })

  it.each(['linear', 'radial'] as const)('cannot perfectly separate %s heights at any threshold', id => {
    const points = transformPoints(xorDataset, featureTransforms[id].height)
    expect(bestHorizontalAccuracy(points)).toBeLessThan(1)
    expect(bestHorizontalAccuracy(points)).toBe(id === 'linear' ? 0.75 : 0.5)
  })

  it('preserves IDs, input coordinates, and labels across transformations and counts actual predictions', () => {
    for (const id of ['linear', 'interaction', 'radial'] as const) {
      const points = transformPoints(xorDataset, featureTransforms[id].height)
      expect(points.map(({ z, ...original }) => {
        expect(z).toBe(featureTransforms[id].height(original.x1, original.x2))
        return original
      })).toEqual(xorDataset)
      for (const height of [0, 1, 4]) {
        const predictions = points.map(point => predictFromScore(horizontalPlaneScore(point, height)))
        const correct = xorDataset.filter((point, index) => point.label === predictions[index]).length
        expect(classificationSummary(points, point => horizontalPlaneScore(point, height)))
          .toEqual({ correct, total: points.length, accuracy: correct / points.length })
      }
    }
  })
})

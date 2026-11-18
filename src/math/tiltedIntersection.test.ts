import { describe, expect, it } from 'vitest'
import { concentricDataset, shiftedCenter, shiftedConcentricDataset } from '../data/datasets'
import { circleToSvg, toSvg } from './coordinateTransforms'
import { classificationSummary, featurePlaneScore, planeHeightAt, predictFromScore } from './featureClassifier'
import { featureTransforms, transformPoints } from './featureTransforms'
import { tiltedIntersection } from './tiltedIntersection'

const radial = featureTransforms.radial.height
const lifted = transformPoints(shiftedConcentricDataset, radial)

describe('shifted circles', () => {
  it('translates each original observation by the intended center without changing IDs or labels', () => {
    expect(shiftedCenter).toEqual({ x1: 1, x2: 0.7 })
    expect(shiftedConcentricDataset).toHaveLength(concentricDataset.length)
    shiftedConcentricDataset.forEach((point, index) => {
      const original = concentricDataset[index]
      expect(point.id).toBe(original.id)
      expect(point.label).toBe(original.label)
      expect(point.x1 - original.x1).toBeCloseTo(1, 12)
      expect(point.x2 - original.x2).toBeCloseTo(0.7, 12)
      expect(Math.hypot(point.x1 - 1, point.x2 - 0.7)).toBeCloseTo(Math.hypot(original.x1, original.x2), 12)
      expect(Math.max(Math.abs(point.x1), Math.abs(point.x2))).toBeLessThan(4)
    })
  })

  it('has overlapping radial heights about the origin, so no horizontal plane separates the classes', () => {
    const maximumInner = Math.max(...lifted.filter(point => point.label === 0).map(point => point.z))
    const minimumOuter = Math.min(...lifted.filter(point => point.label === 1).map(point => point.z))
    expect(maximumInner).toBeGreaterThan(minimumOuter)
  })
})

describe('tilted feature planes', () => {
  it('recovers the origin-centered circle for horizontal planes', () => {
    expect(tiltedIntersection({ a: 0, b: 0, c: 4 })).toMatchObject({ center: { x: 0, y: 0 }, radius: 2 })
  })

  it('handles negative and zero squared radius at an off-center location', () => {
    expect(tiltedIntersection({ a: 2, b: -2, c: -3 })).toMatchObject({ radius: null, points: [] })
    expect(tiltedIntersection({ a: 2, b: -2, c: -2 })).toMatchObject({
      radius: 0, center: { x: 1, y: -1 }, points: [{ x1: 1, x2: -1, z: 2 }],
    })
  })

  it('samples the intersection of both equations and projects it onto the shifted SVG circle', () => {
    const plane = { a: 2, b: 1.4, c: 0.5 }
    const { radius, radiusSquared, center, points } = tiltedIntersection(plane)
    const bounds = { minX: -4, maxX: 4, minY: -4, maxY: 4 }
    const svgCircle = circleToSvg(center, radius!, bounds, 500, 42)
    expect(center).toEqual({ x: 1, y: 0.7 })
    expect(radiusSquared).toBeCloseTo(1.99, 12)
    expect(radius).toBeCloseTo(Math.sqrt(1.99), 12)
    expect(points[0]).toEqual(points[points.length - 1])
    for (const { x1, x2, z } of points) {
      expect(z).toBeCloseTo(radial(x1, x2), 12)
      expect(z).toBeCloseTo(planeHeightAt(x1, x2, plane), 12)
      const svg = toSvg({ x: x1, y: x2 }, bounds, 500, 42)
      expect(Math.hypot(svg.x - svgCircle.center.x, svg.y - svgCircle.center.y)).toBeCloseTo(svgCircle.radius, 10)
    }
  })

  it('predicts by signed score including ties and counts the actual correct labels', () => {
    const plane = { a: 2, b: 0, c: 0 }
    expect([1, 2, 3].map(x1 => predictFromScore(featurePlaneScore({ x1, x2: 0, z: x1 ** 2 }, plane))))
      .toEqual([0, 1, 1])

    const initial = { a: 0, b: 0, c: 1 }
    const correct = lifted.filter(({ z, label }) => (z >= 1 ? 1 : 0) === label).length
    expect(classificationSummary(lifted, point => featurePlaneScore(point, initial)))
      .toEqual({ correct, total: lifted.length, accuracy: correct / lifted.length })
  })

  it('perfectly separates the actual shifted classes at the reference settings', () => {
    const plane = { a: 2, b: 1.4, c: 0.5 }
    expect(classificationSummary(lifted, point => featurePlaneScore(point, plane)))
      .toEqual({ correct: lifted.length, total: lifted.length, accuracy: 1 })
  })
})

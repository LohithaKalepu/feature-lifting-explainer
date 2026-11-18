import { describe, expect, it } from 'vitest'
import { originCircleToSvg, toSvg } from './coordinateTransforms'
import { horizontalPlaneScore, predictFromScore } from './featureClassifier'
import { featureTransforms } from './featureTransforms'
import { radialIntersectionRadius, sampleRadialIntersection } from './radialIntersection'

describe('radial plane intersection', () => {
  it.each([[1, 1], [4, 2]])('at height %s gives radius %s', (height, radius) => {
    expect(radialIntersectionRadius(height)).toBe(radius)
  })

  it('reduces to the origin at zero and disappears below the surface', () => {
    expect(radialIntersectionRadius(0)).toBe(0)
    expect(sampleRadialIntersection(0, radialIntersectionRadius(0))).toEqual([{ x1: 0, x2: 0, z: 0 }])
    expect(radialIntersectionRadius(-0.5)).toBeNull()
    expect(sampleRadialIntersection(-0.5, radialIntersectionRadius(-0.5))).toEqual([])
  })

  it.each([0.01, 1, 4, 7, 16])('closes the curve at height %s and projects it onto the SVG circle', height => {
    const radius = radialIntersectionRadius(height)!
    const bounds = { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    const svg = originCircleToSvg(radius, bounds, 500, 42)
    const points = sampleRadialIntersection(height, radius)
    expect(points.length).toBeGreaterThan(100)
    expect(points[points.length - 1]).toEqual(points[0])

    for (const { x1, x2, z } of points) {
      expect(z).toBe(height)
      expect(featureTransforms.radial.height(x1, x2)).toBeCloseTo(z, 10)
      const point = toSvg({ x: x1, y: x2 }, bounds, 500, 42)
      expect(Math.hypot(point.x - svg.center.x, point.y - svg.center.y)).toBeCloseTo(svg.radius, 10)
    }
  })

  it('classifies points inside as Class 0 and points on or outside as Class 1', () => {
    const height = 4
    const scoreAt = (x1: number, x2: number) =>
      horizontalPlaneScore({ z: featureTransforms.radial.height(x1, x2) }, height)
    expect(predictFromScore(scoreAt(1, 1))).toBe(0)
    expect(predictFromScore(scoreAt(0, -2))).toBe(1)
    expect(predictFromScore(scoreAt(-2, 1))).toBe(1)
  })
})

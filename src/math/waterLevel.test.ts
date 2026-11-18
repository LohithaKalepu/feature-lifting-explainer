import { describe, expect, it } from 'vitest'
import { originCircleToSvg, toSvg } from './coordinateTransforms'
import { horizontalPlanePosition, toWorldPosition } from './coordinates3D'
import { featureTransforms } from './featureTransforms'
import { radialIntersectionAtHeight } from './radialIntersection'

describe('shared water-level geometry', () => {
  it.each([[1, 1], [4, 2]])('at height %s shares radius %s across the disk, rim, and 2D projection', (height, expected) => {
    const { radius, points } = radialIntersectionAtHeight(height)
    expect(radius).toBe(expected)
    const bounds = { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    const projected = originCircleToSvg(radius!, bounds, 500, 42)
    const diskCenter = horizontalPlanePosition(height)

    for (const point of points) {
      const [x, y, z] = toWorldPosition(point)
      expect(point.z).toBe(height)
      expect(y).toBe(diskCenter[1])
      expect(Math.hypot(x - diskCenter[0], z - diskCenter[2])).toBeCloseTo(radius!, 12)
      expect(featureTransforms.radial.height(point.x1, point.x2)).toBeCloseTo(height, 12)
      const svg = toSvg({ x: point.x1, y: point.x2 }, bounds, 500, 42)
      expect(Math.hypot(svg.x - projected.center.x, svg.y - projected.center.y)).toBeCloseTo(projected.radius, 10)
    }
  })

  it('collapses at zero and has no real intersection below the bowl', () => {
    expect(radialIntersectionAtHeight(0)).toEqual({
      height: 0, radius: 0, points: [{ x1: 0, x2: 0, z: 0 }],
    })
    expect(radialIntersectionAtHeight(-0.5)).toEqual({ height: -0.5, radius: null, points: [] })
  })
})

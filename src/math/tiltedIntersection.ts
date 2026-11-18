import type { Coordinates3D } from './coordinates3D'
import { planeHeightAt, type FeaturePlane } from './featureClassifier'
import { sampleRadialIntersection } from './radialIntersection'

export function tiltedIntersection(plane: FeaturePlane) {
  const { a, b, c } = plane
  const center = { x: a / 2, y: b / 2 }
  const radiusSquared = c + (a * a + b * b) / 4
  const radius = radiusSquared < 0 ? null : Math.sqrt(radiusSquared)
  const points: Coordinates3D[] = sampleRadialIntersection(c, radius).map(point => {
    const x1 = point.x1 + center.x
    const x2 = point.x2 + center.y
    return { x1, x2, z: planeHeightAt(x1, x2, plane) }
  })

  return { center, radius, radiusSquared, points }
}

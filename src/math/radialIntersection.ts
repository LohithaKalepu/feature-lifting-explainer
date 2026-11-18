import type { Coordinates3D } from './coordinates3D'

export const radialIntersectionSegments = 128

export function radialIntersectionRadius(height: number): number | null {
  return height < 0 ? null : Math.sqrt(height)
}

export function sampleRadialIntersection(height: number, radius: number | null): Coordinates3D[] {
  if (radius === null) return []
  if (radius === 0) return [{ x1: 0, x2: 0, z: height }]

  const points = Array.from({ length: radialIntersectionSegments }, (_, index) => {
    const angle = index * 2 * Math.PI / radialIntersectionSegments
    return { x1: radius * Math.cos(angle), x2: radius * Math.sin(angle), z: height }
  })
  points.push(points[0])
  return points
}

export function radialIntersectionAtHeight(height: number) {
  const radius = radialIntersectionRadius(height)
  return { height, radius, points: sampleRadialIntersection(height, radius) }
}

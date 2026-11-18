import type { Boundary, Bounds, Point2D } from '../types'

// Intersect the parametric line d*n + t*(-ny,nx) with the plot rectangle.
export function clipBoundary(boundary: Boundary, bounds: Bounds): [Point2D, Point2D] | null {
  const nx = Math.cos(boundary.angle), ny = Math.sin(boundary.angle)
  const origin = { x: boundary.offset * nx, y: boundary.offset * ny }
  const direction = { x: -ny, y: nx }
  let low = -Infinity, high = Infinity
  for (const [start, step, min, max] of [
    [origin.x, direction.x, bounds.minX, bounds.maxX],
    [origin.y, direction.y, bounds.minY, bounds.maxY],
  ]) {
    if (Math.abs(step) < 1e-12) {
      if (start < min || start > max) return null
      continue
    }
    const t1 = (min - start) / step, t2 = (max - start) / step
    low = Math.max(low, Math.min(t1, t2))
    high = Math.min(high, Math.max(t1, t2))
    if (low > high) return null
  }
  return [low, high].map(t => ({ x: origin.x + t * direction.x, y: origin.y + t * direction.y })) as [Point2D, Point2D]
}

export function toSvg(point: Point2D, bounds: Bounds, size: number, padding: number): Point2D {
  const width = size - 2 * padding
  return {
    x: padding + (point.x - bounds.minX) / (bounds.maxX - bounds.minX) * width,
    y: size - padding - (point.y - bounds.minY) / (bounds.maxY - bounds.minY) * width,
  }
}

export function circleToSvg(center: Point2D, radius: number, bounds: Bounds, size: number, padding: number) {
  const svgCenter = toSvg(center, bounds, size, padding)
  const edge = toSvg({ x: center.x + radius, y: center.y }, bounds, size, padding)
  return { center: svgCenter, radius: edge.x - svgCenter.x }
}

export function originCircleToSvg(radius: number, bounds: Bounds, size: number, padding: number) {
  return circleToSvg({ x: 0, y: 0 }, radius, bounds, size, padding)
}

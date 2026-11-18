import type { Boundary, ClassLabel, DataPoint } from '../types'

export function decisionValue(point: Pick<DataPoint, 'x1' | 'x2'>, boundary: Boundary): number {
  return Math.cos(boundary.angle) * point.x1 + Math.sin(boundary.angle) * point.x2 - boundary.offset
}
export function predict(point: Pick<DataPoint, 'x1' | 'x2'>, boundary: Boundary): ClassLabel {
  return decisionValue(point, boundary) >= 0 ? 1 : 0
}
export function accuracy(points: DataPoint[], boundary: Boundary): number {
  if (points.length === 0) return 0
  return points.filter(point => predict(point, boundary) === point.label).length / points.length
}

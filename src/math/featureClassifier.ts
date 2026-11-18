import type { ClassLabel } from '../types'
import type { DataPoint3D } from './coordinates3D'

export function horizontalPlaneScore(point: Pick<DataPoint3D, 'z'>, height: number): number {
  return point.z - height
}

export function predictFromScore(score: number): ClassLabel {
  return score >= 0 ? 1 : 0
}

export function classificationSummary<T extends { label: ClassLabel }>(
  points: readonly T[],
  score: (point: T) => number,
) {
  const correct = points.filter(point => predictFromScore(score(point)) === point.label).length
  const total = points.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}

export interface FeaturePlane {
  a: number
  b: number
  c: number
}

export function planeHeightAt(x1: number, x2: number, { a, b, c }: FeaturePlane): number {
  return a * x1 + b * x2 + c
}

export function featurePlaneScore(point: Pick<DataPoint3D, 'x1' | 'x2' | 'z'>, plane: FeaturePlane): number {
  return point.z - planeHeightAt(point.x1, point.x2, plane)
}

export function bestHorizontalAccuracy(points: readonly DataPoint3D[]): number {
  if (points.length === 0) return 0

  const heights = [...new Set(points.map(point => point.z))].sort((a, b) => a - b)
  const thresholds = [
    heights[0] - 1,
    ...heights.slice(1).map((height, index) => (heights[index] + height) / 2),
    heights[heights.length - 1] + 1,
  ]
  // Under the >= rule, a threshold at a tied height gives the same predictions
  // as a threshold in the gap immediately below it.
  return Math.max(...thresholds.map(
    height => classificationSummary(points, point => horizontalPlaneScore(point, height)).accuracy,
  ))
}

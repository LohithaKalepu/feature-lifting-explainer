import { describe, expect, it } from 'vitest'
import { createConcentricDataset } from '../data/datasets'
import { clipBoundary } from './coordinateTransforms'
import { accuracy, decisionValue, predict } from './linearClassifier'
import type { DataPoint } from '../types'

describe('concentric dataset', () => {
  const points = createConcentricDataset()
  it('is deterministic with the expected class counts and a radial gap', () => {
    expect(points).toEqual(createConcentricDataset())
    expect(points.filter(p => p.label === 0)).toHaveLength(40)
    expect(points.filter(p => p.label === 1)).toHaveLength(60)
    expect(Math.max(...points.filter(p => p.label === 0).map(p => Math.hypot(p.x1, p.x2)))).toBeLessThan(Math.min(...points.filter(p => p.label === 1).map(p => Math.hypot(p.x1, p.x2))))
  })
  it('surrounds every inner point: adjacent outer points form a convex enclosing polygon', () => {
    const inner = points.filter(p => p.label === 0), outer = points.filter(p => p.label === 1)
    for (let i = 0; i < outer.length; i++) {
      const a = outer[i], b = outer[(i + 1) % outer.length]
      for (const p of inner) expect((b.x1 - a.x1) * (p.x2 - a.x2) - (b.x2 - a.x2) * (p.x1 - a.x1)).toBeGreaterThan(0)
    }
  })
})
describe('linear classifier', () => {
  const points: DataPoint[] = [{ id: 'a', x1: -1, x2: 0, label: 0 }, { id: 'b', x1: 1, x2: 0, label: 1 }, { id: 'c', x1: 0, x2: 1, label: 1 }]
  it('predicts from the sign, including zero, and calculates accuracy', () => {
    const boundary = { angle: 0, offset: 0 }
    expect(points.map(p => predict(p, boundary))).toEqual([0, 1, 1])
    expect(accuracy(points, boundary)).toBe(1)
    expect(accuracy([], boundary)).toBe(0)
    expect(accuracy(points, { angle: 0, offset: 2 })).toBeCloseTo(1 / 3)
  })
  it('changes predictions with rotation and offset', () => {
    expect(predict(points[1], { angle: 0, offset: 0 })).toBe(1)
    expect(predict(points[1], { angle: Math.PI, offset: 0 })).toBe(0)
    expect(predict(points[1], { angle: 0, offset: 2 })).toBe(0)
  })
  it('clips horizontal, vertical and angled lines consistently with the decision equation', () => {
    const bounds = { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    for (const angle of [0, Math.PI / 2, Math.PI / 4, Math.PI]) {
      const boundary = { angle, offset: 1 }
      const line = clipBoundary(boundary, bounds)
      expect(line).not.toBeNull()
      for (const p of line!) {
        expect(decisionValue({ x1: p.x, x2: p.y }, boundary)).toBeCloseTo(0, 10)
        expect(Math.abs(p.x)).toBeLessThanOrEqual(3 + 1e-10)
        expect(Math.abs(p.y)).toBeLessThanOrEqual(3 + 1e-10)
      }
    }
    expect(clipBoundary({ angle: 0, offset: 4 }, bounds)).toBeNull()
  })
})

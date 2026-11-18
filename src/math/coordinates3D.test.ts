import { describe, expect, it } from 'vitest'
import { concentricDataset } from '../data/datasets'
import { embedInPlane, toWorldPosition } from './coordinates3D'

describe('3D coordinates', () => {
  it('preserves every original observation and places it at zero height', () => {
    const planarPoints = embedInPlane(concentricDataset)
    expect(planarPoints).toHaveLength(100)
    expect(planarPoints.map(({ z, ...point }) => {
      expect(z).toBe(0)
      expect(toWorldPosition({ ...point, z })).toEqual([point.x1, 0, -point.x2])
      return point
    })).toEqual(concentricDataset)
  })

  it('maps signed coordinates with unit scale and positive height on world Y', () => {
    expect(toWorldPosition({ x1: -2, x2: 3, z: 4 })).toEqual([-2, 4, -3])
  })
})

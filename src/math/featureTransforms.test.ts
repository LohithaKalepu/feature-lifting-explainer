import { describe, expect, it } from 'vitest'
import { concentricDataset } from '../data/datasets'
import { featureTransforms, sampleFeatureSurface, transformPoints } from './featureTransforms'

const equations = {
  original: () => 0,
  linear: (x1: number, x2: number) => x1 + x2,
  interaction: (x1: number, x2: number) => x1 * x2,
  radial: (x1: number, x2: number) => x1 * x1 + x2 * x2,
}

describe('feature transformations', () => {
  it.each([
    [2, -1, 1, -2, 5],
    [-2, 1, -1, -2, 5],
    [2, 1, 3, 2, 5],
    [-2, -1, -3, 2, 5],
    [0, 0, 0, 0, 0],
  ])('computes the expected heights at (%s, %s)', (x1, x2, linear, interaction, radial) => {
    const input = [{ id: 'example', x1, x2, label: 0 as const }]
    expect(transformPoints(input, featureTransforms.original.height)[0].z).toBe(0)
    expect(featureTransforms.linear.height(x1, x2)).toBe(linear)
    expect(featureTransforms.interaction.height(x1, x2)).toBe(interaction)
    expect(featureTransforms.radial.height(x1, x2)).toBe(radial)
  })

  it('preserves radial height under rotation and yields nonnegative heights', () => {
    const { height } = featureTransforms.radial
    for (const radius of [0, 0.25, 1, 2.5, 100]) {
      for (const angle of [-2.1, -0.5, 0, 0.71, 1.8, 4.2]) {
        const z = height(radius * Math.cos(angle), radius * Math.sin(angle))
        expect(z).toBeGreaterThanOrEqual(0)
        expect(z).toBeCloseTo(height(radius, 0), 10)
      }
    }
  })

  for (const id of Object.keys(featureTransforms) as (keyof typeof featureTransforms)[]) {
    it(`preserves observations and places them on the ${id} surface equation`, () => {
      const { height } = featureTransforms[id]
      const observations = transformPoints(concentricDataset, height)
      expect(observations.map(({ z, ...point }) => {
        expect(z).toBeCloseTo(equations[id](point.x1, point.x2), 10)
        return point
      })).toEqual(concentricDataset)

      const { vertices, indices, minZ, maxZ } = sampleFeatureSurface(height, 3)
      expect(vertices).toHaveLength(49 ** 2)
      expect(indices).toHaveLength(48 ** 2 * 6)
      for (const { x1, x2, z } of vertices) {
        expect(z).toBe(height(x1, x2))
        expect(z).toBeCloseTo(equations[id](x1, x2), 10)
      }
      for (const { x1, x2, z } of observations) {
        expect(Math.max(Math.abs(x1), Math.abs(x2))).toBeLessThanOrEqual(3)
        expect(z).toBeGreaterThanOrEqual(minZ)
        expect(z).toBeLessThanOrEqual(maxZ)
      }
    })
  }
})

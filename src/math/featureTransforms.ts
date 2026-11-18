import type { DataPoint } from '../types'
import type { Coordinates3D, DataPoint3D } from './coordinates3D'

export type HeightFunction = (x1: number, x2: number) => number

interface FeatureTransform {
  label: string
  expression: string
  explanation: string
  height: HeightFunction
}

export const featureTransforms = {
  original: {
    label: 'Original',
    expression: 'z = 0',
    explanation: 'All points lie on z = 0. No additional feature has been introduced.',
    height: () => 0,
  },
  linear: {
    label: 'Linear',
    expression: 'z = x₁ + x₂',
    explanation: 'The new feature is a linear combination of the original coordinates, placing the data on a tilted plane.',
    height: (x1, x2) => x1 + x2,
  },
  interaction: {
    label: 'Interaction',
    expression: 'z = x₁ * x₂',
    explanation: 'The new feature captures the interaction between x1 and x2, producing a saddle-shaped surface.',
    height: (x1, x2) => x1 * x2,
  },
  radial: {
    label: 'Radial quadratic',
    expression: 'z = x₁² + x₂²',
    explanation: 'The new feature measures squared distance from the origin. Points farther from the center rise higher, forming a bowl-shaped surface.',
    height: (x1, x2) => x1 ** 2 + x2 ** 2,
  },
} satisfies Record<string, FeatureTransform>

export type FeatureTransformId = keyof typeof featureTransforms

export function transformPoints(points: readonly DataPoint[], height: HeightFunction): DataPoint3D[] {
  return points.map(point => ({ ...point, z: height(point.x1, point.x2) }))
}

export function sampleFeatureSurface(height: HeightFunction, radius: number, segments = 48) {
  const vertices: Coordinates3D[] = []
  const indices: number[] = []
  let minZ = 0
  let maxZ = 0
  const stride = segments + 1

  for (let row = 0; row <= segments; row++) {
    const x2 = -radius + 2 * radius * row / segments
    for (let column = 0; column <= segments; column++) {
      const x1 = -radius + 2 * radius * column / segments
      const z = height(x1, x2)
      vertices.push({ x1, x2, z })
      minZ = Math.min(minZ, z)
      maxZ = Math.max(maxZ, z)

      if (row < segments && column < segments) {
        const a = row * stride + column
        indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride)
      }
    }
  }

  return { vertices, indices, minZ, maxZ }
}

export type FeatureSurfaceData = ReturnType<typeof sampleFeatureSurface>

export function displayedHeight(fullHeight: number, progress: number): number {
  return progress === 0 ? 0 : progress * fullHeight
}

export function observationAtProgress<T extends Coordinates3D>(point: T, progress: number): T {
  return { ...point, z: displayedHeight(point.z, progress) }
}

import type { DataPoint } from '../types'

export interface Coordinates3D {
  x1: number
  x2: number
  z: number
}

export type DataPoint3D = DataPoint & Coordinates3D

export function embedInPlane(points: readonly DataPoint[]): DataPoint3D[] {
  return points.map(point => ({ ...point, z: 0 }))
}

// Three.js is Y-up. Negating world Z preserves the right-handed mathematical
// basis: positive x1 crossed with positive x2 points toward positive height.
export function toWorldPosition({ x1, x2, z }: Coordinates3D): [number, number, number] {
  return [x1, z, -x2]
}

export function horizontalPlanePosition(height: number): [number, number, number] {
  return toWorldPosition({ x1: 0, x2: 0, z: height })
}

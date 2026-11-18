export type ClassLabel = 0 | 1
export interface DataPoint { id: string; x1: number; x2: number; label: ClassLabel }
export interface Boundary { angle: number; offset: number }
export interface Bounds { minX: number; maxX: number; minY: number; maxY: number }
export interface Point2D { x: number; y: number }

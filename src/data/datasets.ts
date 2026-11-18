import type { DataPoint } from '../types'

// Local seeded generator: calling this function never depends on render order or global state.
function randomGenerator(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

export function createConcentricDataset(seed = 375): DataPoint[] {
  const random = randomGenerator(seed)
  const points: DataPoint[] = []
  for (let i = 0; i < 40; i++) {
    const angle = random() * 2 * Math.PI
    const radius = 0.78 * Math.sqrt(random())
    points.push({ id: `inner-${i}`, x1: radius * Math.cos(angle), x2: radius * Math.sin(angle), label: 0 })
  }
  // Stratified angles keep the ring surrounding the center while varying its shape.
  for (let i = 0; i < 60; i++) {
    const angle = (i + (random() - 0.5) * 0.55) * 2 * Math.PI / 60
    const radius = 2.05 + random() * 0.45
    points.push({ id: `outer-${i}`, x1: radius * Math.cos(angle), x2: radius * Math.sin(angle), label: 1 })
  }
  return points
}

export const concentricDataset = createConcentricDataset()

export const shiftedCenter = { x1: 1, x2: 0.7 }

export const shiftedConcentricDataset = concentricDataset.map(point => ({
  ...point,
  x1: point.x1 + shiftedCenter.x1,
  x2: point.x2 + shiftedCenter.x2,
}))

export function createXorDataset(seed = 412): DataPoint[] {
  const random = randomGenerator(seed)
  const quadrants = [[1, 1], [-1, 1], [-1, -1], [1, -1]]

  return Array.from({ length: 20 }, (_, index) => {
    const magnitudeX1 = 0.7 + 1.5 * random()
    const magnitudeX2 = 0.7 + 1.5 * random()
    return quadrants.map(([signX1, signX2], quadrant): DataPoint => {
      const x1 = signX1 * magnitudeX1
      const x2 = signX2 * magnitudeX2
      return { id: `xor-${quadrant}-${index}`, x1, x2, label: x1 * x2 > 0 ? 1 : 0 }
    })
  }).flat()
}

export const xorDataset = createXorDataset()

export function createSpiralDataset(): DataPoint[] {
  const observationsPerArm = 72
  const angleStep = Math.PI / 16

  return ([0, 1] as const).flatMap(label =>
    Array.from({ length: observationsPerArm }, (_, index) => {
      const angle = index * angleStep
      const radius = 0.35 + 0.175 * angle
      const direction = label === 0 ? 1 : -1
      return {
        id: `spiral-${label}-${index}`,
        x1: direction * radius * Math.cos(angle),
        x2: direction * radius * Math.sin(angle),
        label,
      }
    }),
  )
}

export const spiralDataset = createSpiralDataset()

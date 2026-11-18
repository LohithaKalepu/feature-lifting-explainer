import { describe, expect, it } from 'vitest'
import { concentricDataset } from '../data/datasets'
import {
  displayedHeight, featureTransforms, observationAtProgress, sampleFeatureSurface, transformPoints,
} from './featureTransforms'

describe('lifting progress', () => {
  it.each([0, 0.5, 1])('moves only the height of each observation at progress %s', progress => {
    for (const { height } of Object.values(featureTransforms)) {
      const full = transformPoints(concentricDataset, height)
      expect(full.map(point => {
        const { z, ...observation } = observationAtProgress(point, progress)
        expect(z).toBeCloseTo(progress * height(point.x1, point.x2), 12)
        if (progress === 0) expect(z).toBe(0)
        return observation
      })).toEqual(concentricDataset)
    }
  })

  it('uses the observation interpolation for every surface vertex', () => {
    for (const { height } of Object.values(featureTransforms)) {
      const { vertices } = sampleFeatureSurface(height, 3)
      for (const { x1, x2, z } of vertices) {
        for (const progress of [0, 0.5, 1]) {
          expect(displayedHeight(z, progress)).toBeCloseTo(progress * height(x1, x2), 12)
        }
      }
    }
  })

  it('keeps the selected observation and its full feature value across transformations without modifying the dataset', () => {
    const original = concentricDataset.map(point => ({ ...point }))
    const selected = original[42]

    for (const { height } of Object.values(featureTransforms)) {
      const point = transformPoints(concentricDataset, height).find(({ id }) => id === selected.id)
      expect(point).toEqual({ ...selected, z: height(selected.x1, selected.x2) })
    }

    expect(concentricDataset).toEqual(original)
  })
})

import { spiralDataset } from '../src/data/datasets.ts'
import { featureTransforms, transformPoints } from '../src/math/featureTransforms.ts'

export const spiralAuditInput = {
  datasetId: 'chapter-5-spirals',
  observations: spiralDataset,
  mappings: (['linear', 'interaction', 'radial'] as const).map(id => {
    const { label, expression, height } = featureTransforms[id]
    return { id, label, expression, heights: transformPoints(spiralDataset, height).map(point => point.z) }
  }),
}

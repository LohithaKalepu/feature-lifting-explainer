import { HorizontalFeatureChallenge } from '../components/HorizontalFeatureChallenge'
import { xorDataset } from '../data/datasets'
import { bestHorizontalAccuracy } from '../math/featureClassifier'
import { featureTransforms, transformPoints } from '../math/featureTransforms'

const classLabels = ['Class 0 (opposite signs)', 'Class 1 (same sign)'] as const

function renderExplanation() {
  const comparison = (['linear', 'radial'] as const).map(id => ({
    label: featureTransforms[id].label,
    accuracy: bestHorizontalAccuracy(transformPoints(xorDataset, featureTransforms[id].height)),
  }))
  return <section className="explanation" aria-labelledby="xor-explanation-heading">
    <h3 id="xor-explanation-heading">Why the interaction feature works</h3>
    <p>With z = x₁·x₂, same-sign inputs give a positive product and opposite-sign inputs give a negative product. The plane z = 0 separates the two classes.</p>
    <p>Across every possible horizontal threshold on this dataset, {comparison.map(result =>
      `${result.label} reaches at most ${(100 * result.accuracy).toFixed(1)}%`).join(' and ')}.</p>
  </section>
}

export function XorChallenge({ onSelectFeature, onCheck }: {
  onSelectFeature: () => void
  onCheck: () => void
}) {
  return <section aria-labelledby="xor-heading">
    <h2 id="xor-heading">Exercise 2 — The XOR Challenge</h2>
    <p><strong>Which feature transformation makes this dataset linearly separable?</strong></p>
    <p>Unlike concentric circles, XOR places the two classes in opposite diagonal quadrants. Explore how different transformations change the representation of these points.</p>
    <HorizontalFeatureChallenge dataset={xorDataset} datasetName="XOR" classLabels={classLabels}
      plotDescription="Orange points occupy same-sign quadrants. Blue points occupy opposite-sign quadrants."
      renderExplanation={renderExplanation} onSelectFeature={onSelectFeature} onCheck={onCheck} />
  </section>
}

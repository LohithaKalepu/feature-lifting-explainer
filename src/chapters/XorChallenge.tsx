import { HorizontalFeatureChallenge } from '../components/HorizontalFeatureChallenge'
import { xorDataset } from '../data/datasets'

const classLabels = ['Class 0 (opposite signs)', 'Class 1 (same sign)'] as const

export function XorChallenge() {
  return <section aria-labelledby="xor-heading">
    <h2 id="xor-heading">Exercise 2 — The XOR Challenge</h2>
    <p><strong>Which feature transformation makes this dataset linearly separable?</strong></p>
    <p>Unlike concentric circles, XOR places the two classes in opposite diagonal quadrants. Explore how different transformations change the representation of these points.</p>
    <HorizontalFeatureChallenge dataset={xorDataset} datasetName="XOR" classLabels={classLabels} focusXor
      plotDescription="Orange points occupy same-sign quadrants. Blue points occupy opposite-sign quadrants." />
    <section className="explanation" aria-labelledby="xor-explanation-heading">
      <h3 id="xor-explanation-heading">Why Does the Interaction Feature Work?</h3>
      <p>For XOR, the class depends on whether the two original coordinates have the same or opposite signs.</p>
      <p>With <span className="lifting-equation equation-accent">z = x₁ × x₂</span>, same-sign coordinates produce positive z, and opposite-sign coordinates produce negative z. A horizontal separating plane at z = 0 distinguishes the two classes.</p>
      <p>The right feature transformation can turn a difficult classification problem into one that a linear separator can solve.</p>
    </section>
  </section>
}

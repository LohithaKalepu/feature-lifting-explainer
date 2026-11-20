import { HorizontalFeatureChallenge } from '../components/HorizontalFeatureChallenge'
import { spiralDataset } from '../data/datasets'
import { SpiralFeasibility } from './SpiralFeasibility'

const classLabels = ['Class 0 (blue spiral)', 'Class 1 (orange spiral)'] as const

export function Chapter5() {
  return <section id="chapter-5" tabIndex={-1} aria-labelledby="spiral-heading">
    <p className="eyebrow">Chapter 5 — The Limits of Feature Lifting</p>
    <h2 id="spiral-heading">What Happens When Our Transformations Aren't Enough?</h2>
    <p>We've seen feature transformations help us classify concentric circles and XOR patterns. But different patterns require different representations.</p>
    <p>Now let's investigate two intertwined spirals. Can any of our three transformations separate them perfectly? Try changing the feature and the plane height, and compare the live accuracy.</p>
    <HorizontalFeatureChallenge dataset={spiralDataset} datasetName="intertwined spirals"
      plotDescription="The blue and orange classes form two spiral arms that wind around the origin."
      classLabels={classLabels} resettable />
    <SpiralFeasibility />
  </section>
}

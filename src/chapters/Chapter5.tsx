import { HorizontalFeatureChallenge } from '../components/HorizontalFeatureChallenge'
import { spiralDataset } from '../data/datasets'
import { SpiralFeasibility } from './SpiralFeasibility'

const classLabels = ['Class 0 (blue spiral)', 'Class 1 (orange spiral)'] as const

export function Chapter5({ onInteract, onCheck, conclusionUnlocked, onRevealConclusion }: {
  onInteract: () => void
  onCheck: () => void
  conclusionUnlocked: boolean
  onRevealConclusion?: () => void
}) {
  return <section id="chapter-5" tabIndex={-1} aria-labelledby="spiral-heading">
    <p className="eyebrow">Chapter 5 — The Limits of Feature Lifting</p>
    <h2 id="spiral-heading">Can the same feature transformations separate every dataset?</h2>
    <p>So far, we have seen how carefully chosen feature transformations can make difficult classification problems easier. But what happens when the data becomes more complex?</p>
    <p>Try different transformations and plane heights. Can you perfectly separate the two spiral classes?</p>
    <HorizontalFeatureChallenge dataset={spiralDataset} datasetName="intertwined spirals"
      plotDescription="The blue and orange classes form two spiral arms that wind around the origin."
      classLabels={classLabels} resettable onSelectFeature={onInteract} onHeightChange={onInteract} onCheck={onCheck} />
    <SpiralFeasibility showConclusion={conclusionUnlocked}
      conclusionControl={onRevealConclusion && !conclusionUnlocked &&
        <button type="button" onClick={onRevealConclusion}>See What We Learned</button>} />
  </section>
}

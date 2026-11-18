import { useState } from 'react'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { ScatterPlot3D } from '../components/ScatterPlot3D'
import { concentricDataset } from '../data/datasets'
import type { FeatureSurfaceData } from '../math/featureTransforms'
import type { radialIntersectionAtHeight } from '../math/radialIntersection'

const stages = [
  { title: 'The Bowl', text: 'The curved surface represents our transformed feature space, where z = x₁² + x₂².' },
  { title: 'The Water Level', text: 'The water surface is horizontal. Its height corresponds to the position of a linear separating plane.' },
  { title: 'The Intersection', text: 'Where the flat water surface meets the curved bowl, it forms a circle. This is the nonlinear decision boundary seen in the original 2D space.' },
]

export function WaterLevelAnalogy({ intersection, surface, plotRadius, minimumHeight }: {
  intersection: ReturnType<typeof radialIntersectionAtHeight>
  surface: FeatureSurfaceData
  plotRadius: number
  minimumHeight: number
}) {
  const [step, setStep] = useState(0)
  const { radius, points } = intersection

  return <>
    <div className="dataset-views">
      <section>
        <h3>Original 2D projection</h3>
        <ScatterPlot2D points={concentricDataset} circularRadius={radius ?? undefined} />
      </section>
      <section>
        <h3>Paraboloid and water level</h3>
        <ScatterPlot3D points={[]} surface={surface} radius={plotRadius} water={intersection}
          intersection={points} showCameraPresets minimumPlaneHeight={minimumHeight} />
      </section>
    </div>
    <section className="explanation" aria-labelledby="water-stage">
      <h3 id="water-stage">Step {step + 1} — {stages[step].title}</h3>
      <p>{stages[step].text}</p>
      <div className="lifting-buttons">
        <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button>
        <button type="button" disabled={step === stages.length - 1} onClick={() => setStep(step + 1)}>Next</button>
      </div>
    </section>
  </>
}

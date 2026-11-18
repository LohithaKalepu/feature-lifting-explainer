import { useState } from 'react'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { ScatterPlot3D } from '../components/ScatterPlot3D'
import { concentricDataset } from '../data/datasets'
import { classificationSummary, horizontalPlaneScore } from '../math/featureClassifier'
import { featureTransforms, sampleFeatureSurface, transformPoints } from '../math/featureTransforms'
import { radialIntersectionAtHeight } from '../math/radialIntersection'
import { WaterLevelAnalogy } from './WaterLevelAnalogy'

const radius = 3
const minimumHeight = -0.5
const radialHeight = featureTransforms.radial.height
const points = transformPoints(concentricDataset, radialHeight)
const surface = sampleFeatureSurface(radialHeight, radius)

export function Chapter3() {
  const [height, setHeight] = useState(0.4)
  const intersection = radialIntersectionAtHeight(height)
  const { radius: boundaryRadius } = intersection
  const { accuracy, correct, total } = classificationSummary(points, point => horizontalPlaneScore(point, height))

  return <section id="chapter-3" aria-labelledby="linear-model-heading">
    <p className="eyebrow">Chapter 3 — The Linear Model</p>
    <h2 id="linear-model-heading">How can a flat plane create a curved boundary?</h2>
    <p>We’ll use the same concentric observations with the radial quadratic feature z = x₁² + x₂². It gives points farther from the origin a greater height, so a horizontal plane can separate the inner class from the outer ring.</p>
    <div className="dataset-views">
      <section>
        <h3>Original 2D dataset</h3>
        <ScatterPlot2D points={concentricDataset} circularRadius={boundaryRadius ?? undefined} />
      </section>
      <section>
        <h3>Lifted dataset and separating plane</h3>
        <ScatterPlot3D points={points} surface={surface} radius={radius} planeHeight={height}
          minimumPlaneHeight={minimumHeight} intersection={intersection.points} />
      </section>
    </div>
    <fieldset className="lifting-controls">
      <legend>Separating plane</legend>
      <label htmlFor="plane-height">Plane height <strong>c = {height.toFixed(2)}</strong></label>
      <input id="plane-height" type="range" min={minimumHeight} max={7} step={0.01} value={height}
        onChange={event => setHeight(event.target.valueAsNumber)} />
      <p aria-live="polite">Classification accuracy <strong>{(accuracy * 100).toFixed(1)}%</strong>
        {' '}({correct} of {total} correctly classified)</p>
      <p>Points at or above the purple plane (z ≥ c) are predicted as Class 1 (outer). Points below it (z &lt; c) are predicted as Class 0 (inner).</p>
    </fieldset>
    <IntersectionExplanation height={height} boundaryRadius={boundaryRadius} />
    <section className="explanation" aria-labelledby="plane-math-heading">
      <h3 id="plane-math-heading">The linear decision function</h3>
      <p>Feature transformation φ(x) = (x₁, x₂, x₁² + x₂²)</p>
      <p>Decision function f(x) = wᵀφ(x) + b</p>
      <p>For the horizontal plane, w = (0, 0, 1) and b = −c.</p>
      <p>Therefore, f(x) = x₁² + x₂² − c.</p>
      <p>The classifier is linear in the transformed features because its decision function is a weighted sum of those features. The nonlinear terms arise from the feature mapping, not from a nonlinear classifier in feature space.</p>
    </section>
    <p className="chapter-handoff">Here's another way to see it.</p>
    <section aria-labelledby="water-analogy-heading">
      <h3 id="water-analogy-heading">Water-Level Analogy</h3>
      <WaterLevelAnalogy intersection={intersection} surface={surface} plotRadius={radius} minimumHeight={minimumHeight} />
      <fieldset className="lifting-controls">
        <legend>Water level</legend>
        <label htmlFor="water-height">Water height <strong>c = {height.toFixed(2)}</strong></label>
        <input id="water-height" type="range" min={minimumHeight} max={7} step={0.01} value={height}
          onChange={event => setHeight(event.target.valueAsNumber)} />
      </fieldset>
      <IntersectionExplanation height={height} boundaryRadius={boundaryRadius} water />
    </section>
    <p className="chapter-handoff">Now that you've seen how a flat plane creates a curved boundary, can you apply the idea yourself?</p>
  </section>
}

function IntersectionExplanation({ height, boundaryRadius, water = false }: {
  height: number
  boundaryRadius: number | null
  water?: boolean
}) {
  const headingId = water ? 'water-intersection-heading' : 'intersection-heading'
  return <section className="explanation" aria-labelledby={headingId}>
    <h3 id={headingId}>From a plane to a circle</h3>
    <p>{water ? 'Bowl surface' : 'Feature surface'} <strong>z = x₁² + x₂²</strong></p>
    <p>{water ? 'Water surface' : 'Separating plane'} <strong>z = c = {height.toFixed(2)}</strong></p>
    <p>Intersection equation <strong>x₁² + x₂² = {height.toFixed(2)}</strong></p>
    {boundaryRadius === null
      ? <p>{water ? 'The water level' : 'The plane'} is below the paraboloid, so there is no real intersection or 2D boundary.</p>
      : boundaryRadius === 0
        ? <p>At c = 0, the intersection and its projection are a single point at the origin (r = 0).</p>
        : <p>At {water ? 'water' : 'plane'} height c = {height.toFixed(2)}, the projected decision boundary is a circle with radius
          {' '}<strong>r = √c ≈ {boundaryRadius.toFixed(3)}</strong>.</p>}
    <p>Although the separating plane is flat in the transformed feature space, its intersection with the curved feature surface produces a circular decision boundary in the original 2D space.</p>
  </section>
}

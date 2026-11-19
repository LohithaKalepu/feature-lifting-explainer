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
    <h2 id="linear-model-heading">We lifted our data into a new feature space. But how can a linear classifier use it?</h2>
    <p>In Chapter 2, we saw that the transformation z = x₁² + x₂² lifts points farther from the origin higher than those near the center. Now we can place a flat plane between the two classes.</p>
    <div className="dataset-views chapter-three-comparison">
      <section>
        <h3>Original 2D dataset</h3>
        <ScatterPlot2D points={concentricDataset} circularRadius={boundaryRadius ?? undefined} />
      </section>
      <section>
        <h3>Lifted dataset and separating plane</h3>
        <ScatterPlot3D points={points} surface={surface} radius={radius} planeHeight={height}
          minimumPlaneHeight={minimumHeight} intersection={intersection.points} bowlView />
      </section>
    </div>
    <fieldset className="lifting-controls">
      <legend>Separating plane</legend>
      <label htmlFor="plane-height">Plane height <strong>c = {height.toFixed(2)}</strong></label>
      <input id="plane-height" type="range" min={minimumHeight} max={7} step={0.01} value={height}
        onChange={event => setHeight(event.target.valueAsNumber)} />
      <p aria-live="polite">Classification accuracy <strong>{(accuracy * 100).toFixed(1)}%</strong>
        {' '}({correct} of {total} correctly classified)</p>
      <p>Adjust the plane height and watch how the classification accuracy changes.</p>
    </fieldset>
    <section className="explanation" aria-labelledby="intersection-heading">
      <h3 id="intersection-heading">How Does a Flat Plane Create a Circle?</h3>
      <p>The separating plane is flat. So why does the decision boundary look curved in the original 2D space?</p>
      <p>The horizontal plane cuts through the curved feature surface. Where the two surfaces meet, they form a circle. When we look at that intersection in the original 2D space, we see a circular decision boundary.</p>
      <p>Feature surface <strong>z = x₁² + x₂²</strong></p>
      <p>Separating plane <strong>z = c</strong></p>
      <p>At the intersection <strong>x₁² + x₂² = c</strong></p>
    </section>
    <p className="chapter-handoff">Imagine the same intersection as the rim of a pool of water.</p>
    <WaterLevelAnalogy intersection={intersection} surface={surface} plotRadius={radius}
      minimumHeight={minimumHeight} onHeightChange={setHeight} />
    <section className="explanation" aria-labelledby="plane-math-heading">
      <h3 id="plane-math-heading">Why Is the Classifier Still Linear?</h3>
      <h4>Above or Below the Plane?</h4>
      <p>The classifier only needs to determine whether a transformed point lies above or below the horizontal plane.</p>
      <ul>
        <li>z ≥ c → Class 1 (outer)</li>
        <li>z &lt; c → Class 0 (inner)</li>
      </ul>
      <h4>Substitute the Feature Transformation</h4>
      <p>Since z = x₁² + x₂², the rule becomes <strong>x₁² + x₂² − c ≥ 0 → Class 1</strong>. The squared terms give the boundary its curved shape in the original coordinates. The separating rule is still linear in the transformed coordinate z.</p>
      <h4>General Linear Decision Function</h4>
      <p><strong>f(x) = wᵀφ(x) + b</strong></p>
      <p>Here x is the original input, φ(x) is the transformed feature vector, w contains the classifier weights, and b is the bias.</p>
      <p>In this example, φ(x) = (x₁, x₂, x₁² + x₂²), w = (0, 0, 1), and b = −c. Substituting gives <strong>f(x) = x₁² + x₂² − c</strong>.</p>
      <p>The classifier remains linear in the transformed feature space. The nonlinear boundary comes from the transformation of the inputs.</p>
    </section>
    <p className="chapter-handoff">Now that you've seen how a flat plane creates a curved boundary, can you apply the idea yourself?</p>
  </section>
}

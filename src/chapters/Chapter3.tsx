import { useState } from 'react'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { ScatterPlot3D } from '../components/ScatterPlot3D'
import { concentricDataset } from '../data/datasets'
import { classificationSummary, horizontalPlaneScore } from '../math/featureClassifier'
import { featureTransforms, sampleFeatureSurface, transformPoints } from '../math/featureTransforms'
import { radialIntersectionAtHeight } from '../math/radialIntersection'
import { LinearityComparison } from './LinearityComparison'
import { WaterLevelAnalogy } from './WaterLevelAnalogy'

const radius = 3
const minimumHeight = -0.5
const radialHeight = featureTransforms.radial.height
const points = transformPoints(concentricDataset, radialHeight)
const surface = sampleFeatureSurface(radialHeight, radius)
const classifierSurface = {
  ...surface,
  maxZ: radialHeight(radius, 0),
  // Remap the square sample grid onto a disk and evaluate the same feature
  // there. Radius 3 covers the data and the largest intersection, √7.
  vertices: surface.vertices.map(({ x1, x2 }) => {
    const u = x1 * Math.sqrt(1 - (x2 / radius) ** 2 / 2)
    const v = x2 * Math.sqrt(1 - (x1 / radius) ** 2 / 2)
    return { x1: u, x2: v, z: radialHeight(u, v) }
  }),
}

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
        <ScatterPlot3D points={points} surface={classifierSurface} radius={radius} planeHeight={height}
          minimumPlaneHeight={minimumHeight} intersection={intersection.points} focusClassifier />
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
      <p>Feature surface <span className="lifting-equation">z = x₁² + x₂²</span></p>
      <p>Separating plane <span className="lifting-equation">z = c</span></p>
      <p>At the intersection <span className="lifting-equation equation-accent">x₁² + x₂² = c</span></p>
    </section>
    <div className="chapter-three-exploration">
      <WaterLevelAnalogy intersection={intersection} onHeightChange={setHeight} />
      <section className="explanation chapter-three-linearity-section" aria-labelledby="plane-math-heading">
        <h3 id="plane-math-heading">Why Is the Classifier Still Linear?</h3>
        <LinearityComparison points={points} height={height} radius={boundaryRadius} />
        <ol>
          <li>Compare the heights
            <p><span className="lifting-equation">f(x) = z − c</span><br /><span className="math-caption">Point height − plane height</span></p>
          </li>
          <li>Substitute the transformation
            <p><span className="lifting-equation">z = x₁² + x₂²</span><br />
              Therefore, <span className="lifting-equation">f(x) = x₁² + x₂² − c</span></p>
          </li>
          <li>Express it as a linear classifier
            <p><span className="lifting-equation">f(x) = wᵀφ(x) + b</span><br />
              <span className="lifting-equation">φ(x) = (x₁, x₂, z), w = (0, 0, 1), b = −c</span></p>
            <p><span className="lifting-equation">0x₁ + 0x₂ + 1z − c = z − c</span></p>
          </li>
        </ol>
        <p>The classifier uses a linear combination of the transformed features. Its boundary is a flat plane in 3D, even though it appears as a circle in the original 2D space.</p>
      </section>
    </div>
    <p className="chapter-handoff">Now that you've seen how a flat plane creates a curved boundary, can you apply the idea yourself?</p>
  </section>
}

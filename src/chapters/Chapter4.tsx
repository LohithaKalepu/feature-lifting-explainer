import { useState } from 'react'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { ScatterPlot3D } from '../components/ScatterPlot3D'
import { shiftedConcentricDataset } from '../data/datasets'
import { classificationSummary, featurePlaneScore, type FeaturePlane } from '../math/featureClassifier'
import { featureTransforms, sampleFeatureSurface, transformPoints } from '../math/featureTransforms'
import { tiltedIntersection } from '../math/tiltedIntersection'
import { XorChallenge } from './XorChallenge'

const radius = 4
const bounds = { minX: -radius, maxX: radius, minY: -radius, maxY: radius }
const radialHeight = featureTransforms.radial.height
const points = transformPoints(shiftedConcentricDataset, radialHeight)
const surface = sampleFeatureSurface(radialHeight, radius)
const maxTiltX1 = 2.4
const maxTiltX2 = 1.8
const minimumIntercept = -3
const minimumPlaneHeight = minimumIntercept - radius * (maxTiltX1 + maxTiltX2)

export function Chapter4({ onSelectFeature, onCheck, onContinue }: {
  onSelectFeature: () => void
  onCheck: () => void
  onContinue?: () => void
}) {
  return <section id="chapter-4" aria-label="Chapter 4 — Apply Your Understanding">
    <p className="eyebrow">Chapter 4 — Apply Your Understanding</p>
    <TiltChallenge />
    <p>Tilting the plane moves the center of the circle. The next challenge asks you to choose a feature that fits a different pattern.</p>
    <XorChallenge onSelectFeature={onSelectFeature} onCheck={onCheck} />
    <p className="chapter-handoff">Different patterns require different transformations. But can feature lifting solve every classification problem?</p>
    {onContinue && <button type="button" onClick={onContinue}>Continue to Limitations</button>}
  </section>
}

function TiltChallenge() {
  const [plane, setPlane] = useState<FeaturePlane>({ a: 0, b: 0, c: 1 })
  const [tiltUnlocked, setTiltUnlocked] = useState(false)
  const { center, radius: boundaryRadius, radiusSquared, points: intersection } = tiltedIntersection(plane)
  const { correct, total, accuracy } = classificationSummary(points, point => featurePlaneScore(point, plane))

  return <section aria-labelledby="tilt-heading">
    <h2 id="tilt-heading">Exercise 1 — The Tilt Challenge</h2>
    <p>Can changing only the height of a horizontal plane perfectly separate these shifted classes?</p>
    <div className="dataset-views">
      <section>
        <h3>Shifted dataset in 2D</h3>
        <ScatterPlot2D points={shiftedConcentricDataset} bounds={bounds} circularCenter={center}
          circularRadius={boundaryRadius ?? undefined} />
      </section>
      <section>
        <h3>Lifted dataset and separating plane</h3>
        <ScatterPlot3D points={points} surface={surface} radius={radius} tiltedPlane={plane}
          minimumPlaneHeight={minimumPlaneHeight} intersection={intersection} />
      </section>
    </div>
    <fieldset className="lifting-controls">
      <legend>{tiltUnlocked ? 'Stage 2 — Tilt' : 'Stage 1 — Height Only'}</legend>
      <p>{tiltUnlocked
        ? 'Tilting the plane changes the center of the projected circle. The separating plane remains linear in the transformed feature space.'
        : 'Changing the height changes the size of the circle, but its center remains at the origin.'}</p>
      {tiltUnlocked && <>
        <label htmlFor="tilt-x1">Tilt along x₁, a = {plane.a.toFixed(2)}</label>
        <input id="tilt-x1" type="range" min={-maxTiltX1} max={maxTiltX1} step={0.05} value={plane.a}
          onChange={event => setPlane({ ...plane, a: event.target.valueAsNumber })} />
        <label htmlFor="tilt-x2">Tilt along x₂, b = {plane.b.toFixed(2)}</label>
        <input id="tilt-x2" type="range" min={-maxTiltX2} max={maxTiltX2} step={0.05} value={plane.b}
          onChange={event => setPlane({ ...plane, b: event.target.valueAsNumber })} />
      </>}
      <label htmlFor="tilt-intercept">{tiltUnlocked ? 'Vertical intercept' : 'Plane height'}, c = {plane.c.toFixed(2)}</label>
      <input id="tilt-intercept" type="range" min={minimumIntercept} max={5} step={0.05} value={plane.c}
        onChange={event => setPlane({ ...plane, c: event.target.valueAsNumber })} />
      <p aria-live="polite">Classification accuracy <strong>{(100 * accuracy).toFixed(1)}%</strong>
        {' '}({correct} of {total} correctly classified)</p>
      {tiltUnlocked
        ? <p>Plane z = a·x₁ + b·x₂ + c, with (a, b, c) = ({plane.a.toFixed(2)}, {plane.b.toFixed(2)}, {plane.c.toFixed(2)}).</p>
        : <p>Plane z = {plane.c.toFixed(2)}. Projected boundary x₁² + x₂² = {plane.c.toFixed(2)}.</p>}
      {tiltUnlocked && <p>Projected boundary (x₁ − a/2)² + (x₂ − b/2)² = c + (a² + b²)/4 = {radiusSquared.toFixed(3)}.</p>}
      {boundaryRadius === null
        ? <p>The plane has no real intersection with the paraboloid at these settings.</p>
        : <p>Boundary center ({center.x.toFixed(3)}, {center.y.toFixed(3)}), radius {boundaryRadius.toFixed(3)}.
          {boundaryRadius === 0 && ' The intersection is a single point.'}</p>}
      {!tiltUnlocked && <button type="button" onClick={() => setTiltUnlocked(true)}>Try Tilting the Plane</button>}
    </fieldset>
  </section>
}

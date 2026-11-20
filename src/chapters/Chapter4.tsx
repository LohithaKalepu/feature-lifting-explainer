import { useEffect, useRef, useState } from 'react'
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
const initialPlane: FeaturePlane = { a: 0, b: 0, c: 1 }
const cameraTargetHeight = (initialPlane.c + Math.max(...points.map(point => point.z))) / 2
const maxTiltX1 = 2.4
const maxTiltX2 = 1.8
const minimumIntercept = -3
const maximumIntercept = 5
const maximumPlaneHeight = maximumIntercept + radius * (maxTiltX1 + maxTiltX2)
const minimumPlaneHeight = minimumIntercept - 0.1

// The farthest intersection point is at most the maximum center offset plus
// the maximum circle radius. Include the observations and leave rim clearance.
const maximumCenterOffset = Math.hypot(maxTiltX1, maxTiltX2) / 2
const surfaceRadius = Math.max(
  maximumCenterOffset + Math.sqrt(maximumIntercept + maximumCenterOffset ** 2),
  ...points.map(point => Math.hypot(point.x1, point.x2)),
) + 0.1
const squareSurface = sampleFeatureSurface(radialHeight, surfaceRadius, 64)
const surface = {
  ...squareSurface,
  maxZ: radialHeight(surfaceRadius, 0),
  // Map the square parameter grid onto a disk. Evaluate the original feature
  // at each mapped input so only the visible domain changes.
  vertices: squareSurface.vertices.map(({ x1, x2 }) => {
    const u = x1 * Math.sqrt(1 - (x2 / surfaceRadius) ** 2 / 2)
    const v = x2 * Math.sqrt(1 - (x1 / surfaceRadius) ** 2 / 2)
    return { x1: u, x2: v, z: radialHeight(u, v) }
  }),
}

export function Chapter4() {
  return <section id="chapter-4" aria-label="Chapter 4 — Apply Your Understanding">
    <p className="eyebrow">Chapter 4 — Apply Your Understanding</p>
    <TiltChallenge />
    <p>Tilting the plane moves the center of the circle. The next challenge asks you to choose a feature that fits a different pattern.</p>
    <XorChallenge />
    <p className="chapter-handoff">Different patterns require different transformations. But can feature lifting solve every classification problem?</p>
  </section>
}

function TiltChallenge() {
  const [plane, setPlane] = useState<FeaturePlane>(initialPlane)
  const plotEnd = useRef<HTMLDivElement>(null)
  const toolbar = useRef<HTMLFieldSetElement>(null)
  const [canDock, setCanDock] = useState(false)

  useEffect(() => {
    const end = plotEnd.current
    const controls = toolbar.current
    if (!end || !controls) return

    let observer: IntersectionObserver | undefined
    const resize = new ResizeObserver(() => {
      observer?.disconnect()
      // Only dock when the whole toolbar fits below the plots and their camera controls.
      const clearance = Math.ceil(controls.getBoundingClientRect().height) + 12
      observer = new IntersectionObserver(([entry]) => setCanDock(entry.isIntersecting), {
        rootMargin: `0px 0px -${clearance}px 0px`,
      })
      observer.observe(end)
    })
    resize.observe(controls)
    return () => {
      resize.disconnect()
      observer?.disconnect()
    }
  }, [])

  const { center, radius: boundaryRadius, radiusSquared, points: intersection } = tiltedIntersection(plane)
  const { correct, total, accuracy } = classificationSummary(points, point => featurePlaneScore(point, plane))

  return <section aria-labelledby="tilt-heading">
    <h2 id="tilt-heading">Exercise 1 — The Tilt Challenge</h2>
    <p>In the previous example, adjusting the plane's height was enough to separate the classes. But what happens when the data is shifted away from the origin?</p>
    <p>Changing the height makes the circular boundary larger or smaller, but doesn't move its center. To shift the boundary, we can also tilt the plane.</p>
    <div className="tilt-docking-region">
      <div className="dataset-views">
        <section>
          <h3>Shifted dataset in 2D</h3>
          <ScatterPlot2D points={shiftedConcentricDataset} bounds={bounds} circularCenter={center}
            circularRadius={boundaryRadius ?? undefined} />
        </section>
        <section>
          <h3>Lifted dataset and separating plane</h3>
          <ScatterPlot3D points={points} surface={surface} radius={radius} tiltedPlane={plane}
            minimumPlaneHeight={minimumPlaneHeight} maximumPlaneHeight={maximumPlaneHeight}
            intersection={intersection} focusTilt cameraTargetHeight={cameraTargetHeight} />
        </section>
      </div>
      <div ref={plotEnd} className="tilt-plot-end" aria-hidden="true" />
      <fieldset ref={toolbar} className="tilt-toolbar" data-docked={canDock}>
        <legend>Plane controls</legend>
        <div className="tilt-toolbar-row">
          <div>
            <label htmlFor="tilt-intercept">Plane height, c = {plane.c.toFixed(2)}</label>
            <input id="tilt-intercept" type="range" min={minimumIntercept} max={maximumIntercept} step={0.05} value={plane.c}
              onChange={event => setPlane({ ...plane, c: event.target.valueAsNumber })} />
          </div>
          <div>
            <label htmlFor="tilt-x1">Tilt along x₁, a = {plane.a.toFixed(2)}</label>
            <input id="tilt-x1" type="range" min={-maxTiltX1} max={maxTiltX1} step={0.05} value={plane.a}
              onChange={event => setPlane({ ...plane, a: event.target.valueAsNumber })} />
          </div>
          <div>
            <label htmlFor="tilt-x2">Tilt along x₂, b = {plane.b.toFixed(2)}</label>
            <input id="tilt-x2" type="range" min={-maxTiltX2} max={maxTiltX2} step={0.05} value={plane.b}
              onChange={event => setPlane({ ...plane, b: event.target.valueAsNumber })} />
          </div>
          <p className="tilt-toolbar-score" aria-live="polite" aria-atomic="true">Classification accuracy <strong>{(100 * accuracy).toFixed(1)}%</strong>
            <span>{correct} of {total} correctly classified</span>
          </p>
        </div>
      </fieldset>
    </div>
    <div className="tilt-plane-notes">
      <p>Plane <span className="lifting-equation">z = a·x₁ + b·x₂ + c</span>, with (a, b, c) = ({plane.a.toFixed(2)}, {plane.b.toFixed(2)}, {plane.c.toFixed(2)}).</p>
      <p>Projected boundary <span className="lifting-equation equation-accent">(x₁ − a/2)² + (x₂ − b/2)² = c + (a² + b²)/4 = {radiusSquared.toFixed(3)}</span>.</p>
      {boundaryRadius === null
        ? <p>The plane has no real intersection with the paraboloid at these settings.</p>
        : <p>Boundary center ({center.x.toFixed(3)}, {center.y.toFixed(3)}), radius {boundaryRadius.toFixed(3)}.
          {boundaryRadius === 0 && ' The intersection is a single point.'}</p>}
      <h3>How Does the Tilted Plane Classify Points?</h3>
      <p><span className="lifting-equation">f(x) = (x₁² + x₂²) − (ax₁ + bx₂ + c)</span><br />
        <span className="math-caption">Point height (x₁² + x₂²) − Plane height (ax₁ + bx₂ + c)</span></p>
      <ul>
        <li><span className="lifting-equation">f(x) ≥ 0</span> → Class 1 (outer), at or above the plane</li>
        <li><span className="lifting-equation">f(x) &lt; 0</span> → Class 0 (inner), below the plane</li>
        <li><span className="lifting-equation">f(x) = 0</span> → decision boundary</li>
      </ul>
    </div>
  </section>
}

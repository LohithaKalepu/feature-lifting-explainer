import { ScatterPlot3D } from '../components/ScatterPlot3D'
import type { FeatureSurfaceData } from '../math/featureTransforms'
import type { radialIntersectionAtHeight } from '../math/radialIntersection'

export function WaterLevelAnalogy({ intersection, surface, plotRadius, minimumHeight, onHeightChange }: {
  intersection: ReturnType<typeof radialIntersectionAtHeight>
  surface: FeatureSurfaceData
  plotRadius: number
  minimumHeight: number
  onHeightChange: (height: number) => void
}) {
  const { height, radius, points } = intersection

  return <section aria-labelledby="water-analogy-heading">
    <h3 id="water-analogy-heading">Think of It as Filling a Bowl</h3>
    <h4>Imagine a Bowl</h4>
    <p>Imagine the curved feature surface as a bowl. Points near the origin lie near the bottom, while points farther from the origin sit higher along its sides.</p>
    <div className="chapter-three-water-workspace">
      <div>
        <h4>Paraboloid and water level</h4>
        <ScatterPlot3D points={[]} surface={surface} radius={plotRadius} water={intersection}
          intersection={points} showCameraPresets minimumPlaneHeight={minimumHeight} bowlView />
      </div>
      <fieldset className="lifting-controls">
        <legend>Raise the Water Level</legend>
        <p>Now imagine filling the bowl with water. The water surface stays flat, even though the bowl is curved.</p>
        <label htmlFor="water-height">Water height <strong>c = {height.toFixed(2)}</strong></label>
        <input id="water-height" type="range" min={minimumHeight} max={7} step={0.01} value={height}
          onChange={event => onHeightChange(event.target.valueAsNumber)} />
        <p aria-live="polite">Circle radius <strong>{radius === null
          ? 'No real radius'
          : `r = √c ≈ ${radius.toFixed(3)}`}</strong></p>
        <p className="hint">Higher water level → larger intersection circle.</p>
      </fieldset>
    </div>
    <section className="explanation" aria-labelledby="water-circle-heading">
      <h4 id="water-circle-heading">Watch the Circle Grow</h4>
      <p>The water touches the bowl along a circle. As the water level rises, the circle expands because the bowl becomes wider at greater heights.</p>
      <p>The squared radius is <strong>r² = c</strong>, so <strong>r = √c</strong> for c ≥ 0.</p>
      <p>When c = 1, r = 1. When c = 4, r = 2. The radius grows with the square root of the height.</p>
      {radius === null
        ? <p aria-live="polite">At c = {height.toFixed(2)}, the level is below the bowl and there is no real intersection.</p>
        : radius === 0
          ? <p aria-live="polite">At c = 0, the intersection is a single point at the origin.</p>
          : <p aria-live="polite">At c = {height.toFixed(2)}, the radius is approximately {radius.toFixed(3)}.</p>}
    </section>
  </section>
}

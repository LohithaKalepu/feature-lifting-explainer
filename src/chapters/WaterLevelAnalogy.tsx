import type { radialIntersectionAtHeight } from '../math/radialIntersection'

const bowlRadius = 3

export function WaterLevelAnalogy({ intersection, onHeightChange }: {
  intersection: ReturnType<typeof radialIntersectionAtHeight>
  onHeightChange: (height: number) => void
}) {
  const { height, radius } = intersection
  const waterY = 145 - 12 * height

  return <section aria-labelledby="water-analogy-heading">
    <h3 id="water-analogy-heading">Think of It as Filling a Bowl</h3>
    <div className="chapter-three-water-workspace">
      <figure className="chapter-three-illustration">
        <svg viewBox="0 0 240 165" role="img" aria-label={radius === null
          ? 'Paraboloid bowl with its water level below the bottom'
          : `Paraboloid bowl with a flat water surface at height ${height.toFixed(2)}`}>
          {/* x = 120 + 30x₁, y = 145 − 12z + 7x₂. The profile at x₂ = 0
              is exactly quadratic, and horizontal circles project to ellipses. */}
          <path d="M30 37 Q120 253 210 37 A90 21 0 0 0 30 37Z"
            fill="var(--raised-bg)" stroke="var(--plot-axis)" strokeWidth="1.2" />
          <ellipse cx="120" cy="37" rx="90" ry={7 * bowlRadius} fill="none" stroke="var(--plot-grid)" />
          {radius !== null && (radius === 0
            ? <circle cx="120" cy={waterY} r="2.5" fill="var(--boundary)" />
            : <ellipse cx="120" cy={waterY} rx={30 * radius} ry={7 * radius}
              fill="var(--class-0)" fillOpacity=".45" stroke="var(--boundary)" strokeWidth="2" />)}
        </svg>
      </figure>
      <div>
        <p>Imagine the curved feature surface as a bowl. Points near the center sit lower, while points farther away lie higher along the sides.</p>
        <p>Now imagine filling the bowl with water. Its surface stays flat, but the circle where it meets the bowl gets wider as the water rises.</p>
        <fieldset className="lifting-controls">
          <legend>Water level</legend>
          <label htmlFor="water-height">Water height <strong>c = {height.toFixed(2)}</strong></label>
          <input id="water-height" type="range" min={0} max={7} step={0.01} value={Math.max(0, height)}
            onChange={event => onHeightChange(event.target.valueAsNumber)} />
          <p aria-live="polite">{radius === null
            ? 'The shared plane is below the bowl. There is no real intersection.'
            : <>Circle radius <strong>r = √c ≈ {radius.toFixed(3)}</strong>{radius === 0 && ' (a single point)'}</>}</p>
        </fieldset>
      </div>
    </div>
    <p>That circle is the same boundary produced when our flat separating plane intersects the transformed feature surface.</p>
    <p><strong>c = 1 → r = 1</strong> · <strong>c = 4 → r = 2</strong>. The radius grows with the square root of the water height.</p>
  </section>
}

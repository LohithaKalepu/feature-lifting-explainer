import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { classColors, intersectionColor } from '../components/classColors'
import { concentricDataset } from '../data/datasets'
import type { DataPoint3D } from '../math/coordinates3D'

// An oblique projection keeps z vertical and shows depth along the x₂ axis.
function project(x1: number, x2: number, z: number) {
  return [125 + 26 * x1 + 13 * x2, 179 + 7 * x2 - 17 * z]
}

export function LinearityComparison({ points, height, radius }: {
  points: readonly DataPoint3D[]
  height: number
  radius: number | null
}) {
  const plane = [[-3, -3], [3, -3], [3, 3], [-3, 3]]
  return <div className="dataset-views chapter-three-linearity">
    <section>
      <h4>Curved boundary in original space</h4>
      <ScatterPlot2D points={concentricDataset} circularRadius={radius ?? undefined} />
      <p><span className="lifting-equation equation-accent">x₁² + x₂² = c</span></p>
    </section>
    <section>
      <h4>Flat boundary in transformed space</h4>
      <figure className="chapter-three-illustration">
        <svg viewBox="0 0 250 250" role="img" aria-label="The same lifted blue and orange observations and a horizontal plane at the current height">
          <polygon points={plane.map(([x1, x2]) => project(x1, x2, height).join(',')).join(' ')}
            fill={intersectionColor} fillOpacity=".23" stroke={intersectionColor} />
          {points.map(({ id, x1, x2, z, label }) => {
            const [x, y] = project(x1, x2, z)
            return <circle key={id} cx={x} cy={y} r="2.1" fill={classColors[label]} />
          })}
        </svg>
      </figure>
      <p><span className="lifting-equation equation-accent">z = c</span></p>
    </section>
  </div>
}

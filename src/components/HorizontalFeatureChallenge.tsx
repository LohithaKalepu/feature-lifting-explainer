import { useId, useMemo, useState } from 'react'
import { ScatterPlot2D } from './ScatterPlot2D'
import { ScatterPlot3D } from './ScatterPlot3D'
import type { DataPoint } from '../types'
import { classificationSummary, horizontalPlaneScore } from '../math/featureClassifier'
import { featureTransforms, sampleFeatureSurface, transformPoints } from '../math/featureTransforms'

const transformations = ['linear', 'interaction', 'radial'] as const
const plotRadius = 3

export function HorizontalFeatureChallenge({
  dataset, datasetName, plotDescription, classLabels, resettable = false, focusXor = false,
}: {
  dataset: DataPoint[]
  datasetName: string
  plotDescription: string
  classLabels: readonly [string, string]
  resettable?: boolean
  focusXor?: boolean
}) {
  const heightId = useId()
  const [transformId, setTransformId] = useState<(typeof transformations)[number]>('linear')
  const [height, setHeight] = useState(0)
  const transform = featureTransforms[transformId]
  const { minHeight, maxHeight } = useMemo(() => {
    const heights = transformations.flatMap(id => {
      const { height: featureHeight } = featureTransforms[id]
      return dataset.map(point => featureHeight(point.x1, point.x2))
    })
    return {
      minHeight: Math.min(0, Math.floor(Math.min(...heights)) - 1),
      maxHeight: Math.ceil(Math.max(...heights)) + 1,
    }
  }, [dataset])
  const points = useMemo(() => transformPoints(dataset, transform.height), [dataset, transform])
  const surface = useMemo(() => sampleFeatureSurface(transform.height, plotRadius), [transform])
  const { accuracy, correct, total } = classificationSummary(points, point => horizontalPlaneScore(point, height))

  return <>
    <div className="dataset-views">
      <section>
        <h3>Original 2D {datasetName} dataset</h3>
        <ScatterPlot2D points={dataset} plotTitle={`${datasetName} observations`} classLabels={classLabels}
          plotDescription={plotDescription} />
      </section>
      <section>
        <h3>Transformed {datasetName} dataset</h3>
        <ScatterPlot3D points={points} surface={surface} radius={plotRadius}
          planeHeight={height} minimumPlaneHeight={minHeight} maximumPlaneHeight={maxHeight} focusXor={focusXor} />
      </section>
    </div>
    <fieldset className="lifting-controls">
      <legend>Feature transformation</legend>
      <div className="lifting-buttons">
        {transformations.map(id => <button key={id} type="button" aria-pressed={transformId === id}
          onClick={() => {
            if (id === transformId) return
            setTransformId(id)
          }}>{featureTransforms[id].label}</button>)}
      </div>
      <p className="feature-description">{transform.label} feature <span className="lifting-equation equation-accent">{transform.expression}</span></p>
      <label htmlFor={heightId}>Plane height <strong>c = {height.toFixed(2)}</strong></label>
      <input id={heightId} type="range" min={minHeight} max={maxHeight} step={0.05} value={height}
        onChange={event => setHeight(event.target.valueAsNumber)} />
      <p aria-live="polite">Classification accuracy <strong>{(100 * accuracy).toFixed(1)}%</strong>
        {' '}({correct} of {total} correctly classified)</p>
      <p>The classifier predicts Class 1 at or above the plane and Class 0 below it.</p>
      {resettable && <div className="lifting-buttons">
        <button type="button" onClick={() => {
          setTransformId('linear')
          setHeight(0)
        }}>Reset</button>
      </div>}
    </fieldset>
  </>
}

import { useId, useMemo, useState, type ReactNode } from 'react'
import { ScatterPlot2D } from './ScatterPlot2D'
import { ScatterPlot3D } from './ScatterPlot3D'
import type { DataPoint } from '../types'
import { classificationSummary, horizontalPlaneScore } from '../math/featureClassifier'
import { featureTransforms, sampleFeatureSurface, transformPoints } from '../math/featureTransforms'

const transformations = ['linear', 'interaction', 'radial'] as const
const plotRadius = 3

export function HorizontalFeatureChallenge({
  dataset, datasetName, plotDescription, classLabels, renderExplanation, resettable = false, onSelectFeature, onHeightChange, onCheck,
}: {
  dataset: DataPoint[]
  datasetName: string
  plotDescription: string
  classLabels: readonly [string, string]
  renderExplanation?: () => ReactNode
  resettable?: boolean
  onSelectFeature?: () => void
  onHeightChange?: () => void
  onCheck?: () => void
}) {
  const heightId = useId()
  const [transformId, setTransformId] = useState<(typeof transformations)[number]>('linear')
  const [height, setHeight] = useState(0)
  const [feedback, setFeedback] = useState<'success' | 'retry'>()
  const [attempted, setAttempted] = useState(false)
  const [revealed, setRevealed] = useState(false)
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
          planeHeight={height} minimumPlaneHeight={minHeight} maximumPlaneHeight={maxHeight} />
      </section>
    </div>
    <fieldset className="lifting-controls">
      <legend>Feature transformation</legend>
      <div className="lifting-buttons">
        {transformations.map(id => <button key={id} type="button" aria-pressed={transformId === id}
          onClick={() => {
            onSelectFeature?.()
            if (id === transformId) return
            setTransformId(id)
            setFeedback(undefined)
          }}>{featureTransforms[id].label}</button>)}
      </div>
      <p className="feature-description">{transform.label} feature <strong>{transform.expression}</strong></p>
      <label htmlFor={heightId}>Plane height <strong>c = {height.toFixed(2)}</strong></label>
      <input id={heightId} type="range" min={minHeight} max={maxHeight} step={0.05} value={height}
        onChange={event => {
          onHeightChange?.()
          setHeight(event.target.valueAsNumber)
          setFeedback(undefined)
        }} />
      <p aria-live="polite">Classification accuracy <strong>{(100 * accuracy).toFixed(1)}%</strong>
        {' '}({correct} of {total} correctly classified)</p>
      <p>The classifier predicts Class 1 at or above the plane and Class 0 below it.</p>
      <div className="lifting-buttons">
        <button type="button" onClick={() => {
          onCheck?.()
          setAttempted(true)
          setFeedback(accuracy === 1 ? 'success' : 'retry')
        }}>Check My Solution</button>
        {resettable && <button type="button" onClick={() => {
          setTransformId('linear')
          setHeight(0)
          setFeedback(undefined)
          setAttempted(false)
          setRevealed(false)
        }}>Reset</button>}
        {renderExplanation && attempted && <button type="button" aria-expanded={revealed}
          onClick={() => setRevealed(value => !value)}>{revealed ? 'Hide Explanation' : 'Reveal Explanation'}</button>}
      </div>
      <div role="status">
        {feedback === 'success' && <p className="success-feedback">All {total} observations are correctly classified. The plane separates the two classes in this representation.</p>}
        {feedback === 'retry' && <p>{correct} of {total} observations are correct. Try another height or compare a different feature transformation.</p>}
      </div>
    </fieldset>
    {revealed && renderExplanation?.()}
  </>
}

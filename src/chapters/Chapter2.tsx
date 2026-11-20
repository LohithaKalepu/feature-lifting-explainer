import { useEffect, useMemo, useRef, useState } from 'react'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { ScatterPlot3D } from '../components/ScatterPlot3D'
import { concentricDataset } from '../data/datasets'
import { FeatureLiftingIntroduction } from './FeatureLiftingIntroduction'
import {
  displayedHeight, featureTransforms, sampleFeatureSurface, transformPoints, type FeatureTransformId,
} from '../math/featureTransforms'

const plotRadius = 3
const transformIds = Object.keys(featureTransforms) as FeatureTransformId[]
const liftingDuration = 1800
const formatCoordinate = (value: number) => Number(value.toFixed(3)).toString()

export function Chapter2() {
  const [transformId, setTransformId] = useState<FeatureTransformId>('original')
  const [progress, setProgress] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const [playing, setPlaying] = useState(false)
  const frame = useRef<number>()
  const { label, height, expression, explanation } = featureTransforms[transformId]
  const points = useMemo(() => transformPoints(concentricDataset, height), [height])
  const surface = useMemo(
    () => transformId === 'original' ? undefined : sampleFeatureSurface(height, plotRadius),
    [height, transformId],
  )
  const selectedPoint = points.find(point => point.id === selectedId)

  useEffect(() => () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
  }, [])

  function stopAt(value: number) {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = undefined
    setPlaying(false)
    setProgress(value)
  }

  function playLifting() {
    stopAt(0)
    setPlaying(true)
    let start: number | undefined

    function tick(now: number) {
      start ??= now
      const next = Math.min(1, (now - start) / liftingDuration)
      setProgress(next)

      if (next < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        frame.current = undefined
        setPlaying(false)
      }
    }

    frame.current = requestAnimationFrame(tick)
  }

  return <section id="chapter-2" tabIndex={-1} aria-labelledby="lifting-heading">
    <p className="eyebrow">Chapter 2 — Feature Lifting</p>
    <h2 id="lifting-heading">What if we looked at the same data differently?</h2>
    <FeatureLiftingIntroduction />
    <div className="chapter-two-workspace">
      <fieldset className="lifting-controls">
        <legend>Feature transformation</legend>
        <p>Choose a feature to see how the same data can be represented differently.</p>
        <div className="lifting-buttons">
          {transformIds.map(id => {
            const { label, expression } = featureTransforms[id]
            return <button key={id} type="button" aria-pressed={transformId === id} onClick={() => {
              if (id === transformId) return
              stopAt(0)
              setTransformId(id)
            }}>{label} ({expression})</button>
          })}
        </div>
        <div className="feature-description" aria-live="polite">
          {transformId === 'original'
            ? <p>Original representation — no additional feature has been applied yet. All points lie on <strong>z = 0</strong>.</p>
            : <>
              <p>{label} feature <strong>{expression}</strong></p>
              <p>{explanation}</p>
            </>}
        </div>
      </fieldset>
      <fieldset className="lifting-controls chapter-two-lifting-controls">
        <legend>Lift the points</legend>
        <div className="chapter-two-playback">
          <div className="chapter-two-progress">
            <label htmlFor="lifting-progress">Lifting Progress <strong>{Math.round(progress * 100)}%</strong></label>
            <input id="lifting-progress" type="range" min={0} max={100} step={1} value={Math.round(progress * 100)}
              aria-valuetext={`${Math.round(progress * 100)}%`}
              onChange={event => stopAt(Number(event.target.value) / 100)} />
          </div>
          <div className="lifting-buttons">
            <button type="button" onClick={playLifting} disabled={playing}>Play Lifting</button>
            <button type="button" onClick={() => stopAt(0)}>Reset Lifting</button>
          </div>
        </div>
      </fieldset>
      <div className="dataset-views">
        <section>
          <h3>Original 2D dataset</h3>
          <ScatterPlot2D points={concentricDataset} selectedId={selectedId} onSelect={setSelectedId} />
        </section>
        <section>
          <h3>Interactive 3D dataset</h3>
          <ScatterPlot3D points={points} surface={surface} radius={plotRadius} progress={progress}
            selectedId={selectedId} onSelect={setSelectedId} />
        </section>
      </div>
    </div>
    <section className="explanation" aria-labelledby="selected-point-heading">
      <h3 id="selected-point-heading">Selected point</h3>
      {selectedPoint ? <>
        <p>Original point ({formatCoordinate(selectedPoint.x1)}, {formatCoordinate(selectedPoint.x2)})</p>
        <p>Selected feature <strong>{expression}</strong></p>
        <p>Calculated feature value <strong>z = {formatCoordinate(selectedPoint.z)}</strong></p>
        <p>Transformed point ({formatCoordinate(selectedPoint.x1)}, {formatCoordinate(selectedPoint.x2)}, {formatCoordinate(selectedPoint.z)})</p>
        <p>Current displayed height <strong>{formatCoordinate(displayedHeight(selectedPoint.z, progress))}</strong></p>
      </> : <p>Select a point in either plot to see its coordinates and feature value.</p>}
    </section>
    <p>Notice that the original x1 and x2 coordinates never changed. Feature lifting introduces a new coordinate derived from the original inputs, changing how the same observations are represented.</p>
    <p className="chapter-handoff">We've changed the representation of our data. But how does a linear classifier use it?</p>
  </section>
}

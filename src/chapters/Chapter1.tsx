import { useState } from 'react'
import { BoundaryControls } from '../components/BoundaryControls'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { concentricDataset } from '../data/datasets'
import { accuracy } from '../math/linearClassifier'
import type { Boundary } from '../types'

const initialBoundary: Boundary = { angle: 0, offset: 0 }
export function Chapter1({ experimented, revealed, onExperiment, onReveal, onContinue }: {
  experimented: boolean
  revealed: boolean
  onExperiment: () => void
  onReveal: () => void
  onContinue: () => void
}) {
  const [boundary, setBoundary] = useState<Boundary>(initialBoundary)
  function updateBoundary(value: Boundary) { setBoundary(value); onExperiment() }
  return <section id="chapter-1" aria-labelledby="chapter-heading">
    <p className="eyebrow">Chapter 1 · The Problem</p>
    <h2 id="chapter-heading">Can a straight line separate these two classes?</h2>
    <p>Adjust the decision boundary to classify the blue points in the center and the orange points around them.</p>
    <p>Try rotating and moving the line. Can you reach 100% accuracy?</p>
    <div className="workspace">
      <ScatterPlot2D points={concentricDataset} boundary={boundary} />
      <div className="sidebar">
        <BoundaryControls boundary={boundary} onChange={updateBoundary} onReset={() => setBoundary(initialBoundary)} />
        <div className="accuracy" aria-live="polite"><span>Classification accuracy</span><strong>{(accuracy(concentricDataset, boundary) * 100).toFixed(1)}%</strong></div>
        <p className="hint">Points on the positive side of the line are predicted as Class 1; points on the other side are predicted as Class 0.</p>
        <button type="button" disabled={!experimented || revealed} onClick={onReveal}>Reveal Explanation</button>
        {!experimented && <p className="hint">Move a slider to unlock the explanation.</p>}
      </div>
    </div>
    {revealed && <div className="explanation"><h3>Why a line falls short</h3><p>A straight line divides the plane into two half-planes. Because one class surrounds the other, no single straight line can perfectly separate these concentric classes.</p></div>}
    <p className="chapter-handoff">A straight line isn't enough. What if we changed how the same data is represented?</p>
    {revealed && <button type="button" onClick={onContinue}>Continue to Feature Lifting</button>}
  </section>
}

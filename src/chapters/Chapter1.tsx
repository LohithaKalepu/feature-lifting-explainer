import { useState } from 'react'
import { BoundaryControls } from '../components/BoundaryControls'
import { ScatterPlot2D } from '../components/ScatterPlot2D'
import { concentricDataset } from '../data/datasets'
import { accuracy } from '../math/linearClassifier'
import type { Boundary } from '../types'

const initialBoundary: Boundary = { angle: 0, offset: 0 }

export function Chapter1() {
  const [boundary, setBoundary] = useState<Boundary>(initialBoundary)

  return <section id="chapter-1" aria-labelledby="chapter-heading">
    <div id="chapter-one-challenge" className="chapter-one-challenge" role="region"
      aria-labelledby="chapter-heading" tabIndex={-1}>
      <div className="chapter-one-brief">
        <p className="eyebrow">Chapter 1 · The Problem</p>
        <h2 id="chapter-heading">Can a straight line separate these two classes?</h2>
        <p>Blue points occupy the center, while orange points form a surrounding ring. Try moving and rotating a straight line to separate them.</p>
      </div>
      <div className="chapter-one-plot">
        <ScatterPlot2D points={concentricDataset} boundary={boundary} />
        <BoundaryControls boundary={boundary} onChange={setBoundary} onReset={() => setBoundary(initialBoundary)} />
      </div>
      <div className="chapter-one-feedback">
        <div className="accuracy" aria-live="polite">
          <span>Classification accuracy</span>
          <strong>{(accuracy(concentricDataset, boundary) * 100).toFixed(1)}%</strong>
        </div>
        <p className="hint">Points on the positive side of the line are predicted as Class 1. Points on the other side are predicted as Class 0.</p>
      </div>
    </div>
    <section className="chapter-one-discovery" aria-labelledby="chapter-one-discovery-heading">
      <h3 id="chapter-one-discovery-heading">Why a Line Falls Short</h3>
      <p>A straight line divides the plane into two half-planes. Because one class surrounds the other, no single straight line can perfectly separate these concentric classes.</p>
      <p className="chapter-one-question">What if we looked at the same data differently?</p>
      <p>We've been describing these points using two coordinates. But those coordinates can also help us calculate new features.</p>
    </section>
  </section>
}

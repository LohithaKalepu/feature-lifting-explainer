import type { ReactNode } from 'react'
import results from '../data/spiral_feasibility_results.json'

const outcomeLabels: Record<string, string> = {
  feasible: 'Feasible',
  infeasible: 'Infeasible',
  inconclusive: 'Inconclusive',
}

export function SpiralFeasibility({ showConclusion, conclusionControl }: {
  showConclusion: boolean
  conclusionControl?: ReactNode
}) {
  const outcomes = results.transformations.map(result => result.outcome)
  const feasible = results.transformations.filter(result => result.outcome === 'feasible')
  const inconclusive = outcomes.includes('inconclusive')

  return <>
    <section className="explanation" aria-labelledby="spiral-feasibility-heading">
      <h3 id="spiral-feasibility-heading">Can Any Linear Plane Separate These Spirals?</h3>
      <p>We tried horizontal planes, but what if we allowed the separating plane to tilt in any direction?</p>
      <p>The audit used all {results.dataset.observationCount} spiral observations. It allowed all three feature weights and the intercept to vary, so it tested every orientation and position of a linear plane.</p>
      <p>For f(x) = w₁x₁ + w₂x₂ + w₃g(x₁, x₂) + b, the solver looked for coefficients with yᵢf(xᵢ) ≥ 1 for every observation, where y is +1 for Class 1 and −1 for Class 0.</p>
      <table>
        <caption>Strict linear separation on the spiral dataset</caption>
        <thead>
          <tr><th scope="col">Transformation</th><th scope="col">Feature</th><th scope="col">General plane</th></tr>
        </thead>
        <tbody>
          {results.transformations.map(result => <tr key={result.id}>
            <th scope="row">{result.label}</th>
            <td>{result.expression}</td>
            <td>{outcomeLabels[result.outcome] ?? outcomeLabels.inconclusive}</td>
          </tr>)}
        </tbody>
      </table>
      {outcomes.every(outcome => outcome === 'infeasible')
        ? <p>Even when we allow the separating plane to rotate and move freely, none of these three feature mappings makes our chosen spiral observations perfectly linearly separable.</p>
        : <>
          {feasible.length > 0 && <p>The audit verified strict separation for {feasible.map(result => result.label).join(', ')}.</p>}
          {inconclusive && <p>Inconclusive results leave open whether those mappings admit a separating plane.</p>}
        </>}
      <p>Other feature mappings can produce different representations of spirals. These results apply to the three mappings and the finite set of observations tested here.</p>
    </section>
    <section className="explanation" aria-labelledby="expressivity-heading">
      <h3 id="expressivity-heading">Why Not Keep Adding More Features?</h3>
      <p>More expressive feature mappings can produce more complicated decision boundaries and make difficult patterns easier to separate. Perfect accuracy on training observations gives no guarantee about unseen data. A highly expressive representation can increase the risk of overfitting, depending on the model, regularization, and available data.</p>
    </section>
    {conclusionControl}
    {showConclusion && <section className="explanation" aria-labelledby="explainer-conclusion-heading">
      <h3 id="explainer-conclusion-heading" tabIndex={-1}>What Did We Learn?</h3>
      <ol>
        <li>A straight line cannot perfectly separate the original concentric classes.</li>
        <li>Feature lifting adds coordinates derived from the original inputs.</li>
        <li>A linear classifier in the lifted space can create a nonlinear boundary in the original space.</li>
        <li>The plane’s intersection with a curved feature surface explains the shape of that boundary.</li>
        <li>The usefulness of a feature mapping depends on the dataset.</li>
      </ol>
      <p className="chapter-handoff"><strong>The classifier can remain linear in the transformed feature space, even when its decision boundary is nonlinear in the original input space.</strong></p>
    </section>}
  </>
}

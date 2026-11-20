import results from '../data/spiral_feasibility_results.json'

const outcomeLabels: Record<string, string> = {
  feasible: 'Feasible',
  infeasible: 'Infeasible',
  inconclusive: 'Inconclusive',
}

export function SpiralFeasibility() {
  const outcomes = results.transformations.map(result => result.outcome)
  const feasible = results.transformations.filter(result => result.outcome === 'feasible')
  const inconclusive = outcomes.includes('inconclusive')

  return <>
    <section className="explanation" aria-labelledby="spiral-feasibility-heading">
      <h3 id="spiral-feasibility-heading">But What If We Tilted the Plane?</h3>
      <p>So far, we've only moved a horizontal plane up and down. Perhaps a tilted plane could do better.</p>
      <p>We therefore tested whether any flat separating plane, regardless of its orientation or position, could perfectly classify the {results.dataset.observationCount} transformed spiral observations.</p>
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
      <p>The results apply to the three mappings and the observations tested here. Infeasible means the audit ruled out a strictly separating plane for that mapping on this dataset.</p>
      <details>
        <summary>How we checked</summary>
        <p>For f(x) = w₁x₁ + w₂x₂ + w₃g(x₁, x₂) + b, the solver looked for coefficients with yᵢf(xᵢ) ≥ 1 for every observation, where y is +1 for Class 1 and −1 for Class 0. The audit let all three weights and the intercept vary.</p>
      </details>
    </section>
    <section className="explanation" aria-labelledby="expressivity-heading">
      <h3 id="expressivity-heading">Why Not Keep Adding More Features?</h3>
      <p>Our three transformations may miss the structure we need to separate the spiral classes. What if we designed a feature that captured the spiral pattern itself? A more expressive representation might make these observations easier to separate.</p>
      <p>So why not keep adding increasingly complex features until every observation is classified correctly? Perfect accuracy on the observations we already have does not guarantee good predictions on new ones. The risk of overfitting depends on the data, feature representation, model complexity, and regularization.</p>
    </section>
    <section className="explanation" aria-labelledby="explainer-conclusion-heading">
      <h3 id="explainer-conclusion-heading">What Did We Learn?</h3>
      <ol>
        <li>A straight line cannot perfectly separate the original concentric classes.</li>
        <li>Feature lifting adds coordinates derived from the original inputs.</li>
        <li>A flat plane separated the lifted concentric observations and projected back to a circular boundary.</li>
        <li>Concentric circles and XOR benefited from different features.</li>
        <li>A limited set of features may fall short on a different dataset, as we saw with the spirals.</li>
      </ol>
      <p className="chapter-handoff"><strong>The classifier can remain linear in the transformed feature space, even when its decision boundary is nonlinear in the original input space.</strong></p>
    </section>
  </>
}

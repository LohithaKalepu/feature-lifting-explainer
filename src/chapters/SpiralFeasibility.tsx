import results from '../data/spiral_feasibility_results.json'

const outcomeLabels: Record<string, string> = {
  feasible: 'Yes',
  infeasible: 'No, there is no separating plane',
  inconclusive: 'Inconclusive',
}

export function SpiralFeasibility() {
  return <>
    <section className="explanation" aria-labelledby="spiral-threshold-heading">
      <h3 id="spiral-threshold-heading">Why Couldn't We Reach 100%?</h3>
      <p>For each of the three features we tried, every horizontal plane misclassifies at least one of these spiral observations.</p>
      <h4>But What If We Tilted the Plane?</h4>
      <p>For each feature, a solver checked whether any linear plane, at any angle or position, could put all {results.dataset.observationCount} transformed observations strictly on the correct sides.</p>
      <table>
        <caption>Can a linear plane perfectly separate these spiral observations?</caption>
        <thead>
          <tr><th scope="col">Transformation</th><th scope="col">Feature</th><th scope="col">Audit result</th></tr>
        </thead>
        <tbody>
          {results.transformations.map(result => <tr key={result.id}>
            <th scope="row">{result.label}</th>
            <td>{result.expression}</td>
            <td>{outcomeLabels[result.outcome] ?? outcomeLabels.inconclusive}</td>
          </tr>)}
        </tbody>
      </table>
      <details>
        <summary>How we checked</summary>
        <p>For <span className="lifting-equation">f(x) = w₁x₁ + w₂x₂ + w₃g(x₁, x₂) + b</span>, the solver varied all three weights and the intercept to look for <span className="lifting-equation">yᵢf(xᵢ) ≥ 1</span> for every observation, where y is +1 for Class 1 and −1 for Class 0. Any strict separator for a finite dataset can be scaled to meet this unit-margin constraint. An infeasible result means no coefficients satisfy it.</p>
      </details>
    </section>
    <section className="explanation" aria-labelledby="expressivity-heading">
      <h3 id="expressivity-heading">What if we kept adding new features?</h3>
      <p>A more expressive representation might capture the spiral pattern and make the classes easier to separate. A model can still overfit by learning details peculiar to the training observations. Even perfect training accuracy leaves open how well it will classify unseen examples.</p>
    </section>
    <section className="explanation" aria-labelledby="explainer-conclusion-heading">
      <h3 id="explainer-conclusion-heading">What Did We Learn?</h3>
      <p><strong>Feature lifting allows us to keep the classifier linear in a transformed feature space while producing nonlinear decision boundaries in the original input space.</strong></p>
      <p>The radial quadratic feature gave the concentric classes a circular boundary. The interaction feature separated the XOR classes by the sign of the product. For the spirals, none of the three features we tried allowed perfect linear separation.</p>
      <p className="chapter-handoff">Feature lifting works when the added features capture structure that helps distinguish the classes. Adding dimensions alone gives no guarantee of separation.</p>
    </section>
  </>
}

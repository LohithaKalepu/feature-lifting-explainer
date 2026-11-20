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
      <p>For each of the three features we tried, every horizontal plane misclassifies at least one observation. The spirals wind around the center, and these features capture too little of that winding pattern for a height cutoff to separate the classes.</p>
      <h4>But What If We Tilted the Plane?</h4>
      <p>Moving the horizontal plane explores just one orientation. For each feature, a solver checked whether a plane at any angle or position could put all {results.dataset.observationCount} transformed observations strictly on the correct sides.</p>
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
        <p>The score is <strong>f(x) = wᵀφ(x) + b</strong>, where φ(x) = (x₁, x₂, g(x₁, x₂)). The solver looked for one set of weights w and intercept b that satisfies <strong>tᵢ(wᵀφ(xᵢ) + b) ≥ 1</strong> for every observation, with tᵢ = +1 for Class 1 and −1 for Class 0.</p>
        <p>This asks for a positive score for Class 1 and a negative score for Class 0, each with magnitude at least 1. The 1 sets a scale for the score. On a finite dataset, any strict separator can meet that scale by multiplying the weights and intercept by the same positive factor. The plane stays in place.</p>
      </details>
      <h4>Could We Design a Better Transformation?</h4>
      <p>The result applies to these spiral observations and the three features we tested. A feature that combines distance from the center with angle around it might capture how the spirals wind. If a better feature might work, why stop at just one?</p>
    </section>
    <section className="explanation" aria-labelledby="expressivity-heading">
      <h3 id="expressivity-heading">What if we kept adding new features?</h3>
      <p>More expressive features can give a linear classifier more flexible boundaries in the original space. The radial quadratic feature captured distance from the center for concentric circles, and the interaction feature captured the sign pattern for XOR. Each made its training observations perfectly separable because it captured a pattern that distinguished the classes. Adding features alone gives no guarantee of separation.</p>
      <p>Flexible boundaries can capture useful patterns, but they can also fit noise or details specific to the training observations. Even with perfect training accuracy, how well the classifier handles unseen examples remains an open question.</p>
    </section>
    <section className="explanation" aria-labelledby="explainer-conclusion-heading">
      <h3 id="explainer-conclusion-heading">What Did We Learn?</h3>
      <p>Feature lifting is about constructing features that make useful patterns accessible to a linear classifier.</p>
      <p className="chapter-handoff"><strong>A classifier can remain linear in its transformed feature space even when its decision boundary is nonlinear in the original space.</strong></p>
    </section>
  </>
}

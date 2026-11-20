import { featureTransforms } from '../math/featureTransforms'

const x = 2
const x1 = 1
const x2 = 2
const z = featureTransforms.radial.height(x1, x2)

export function FeatureLiftingIntroduction() {
  return <div className="lifting-introduction">
    <p>We’ve been representing each observation using two coordinates, x₁ and x₂. But these coordinates can also be used to calculate new quantities.</p>

    <section aria-labelledby="derived-feature-heading">
      <h3 id="derived-feature-heading">A derived feature</h3>
      <p>Given a number x, we can calculate x². We haven’t changed x; we’ve calculated something additional from it.</p>
      <p className="lifting-equation"><strong>x → x²</strong></p>
      <dl className="scalar-example">
        <div><dt>Original value</dt><dd>x = {x}</dd></div>
        <div><dt>Derived value</dt><dd>x² = {x ** 2}</dd></div>
      </dl>
    </section>

    <section aria-labelledby="lifted-point-heading">
      <h3 id="lifted-point-heading">From two coordinates to three</h3>
      <p>Start with (x₁, x₂) = ({x1}, {x2}). Define the derived feature z = x₁² + x₂², so z = {x1}² + {x2}² = {z}.</p>
      <figure className="lifting-diagram">
        <div className="lifting-diagram-flow">
          <div>
            <span>Original 2D point</span>
            <strong>(x₁, x₂)</strong>
            <span>({x1}, {x2})</span>
          </div>
          <div className="lifting-diagram-arrow">
            <span>Feature transformation</span>
            <svg viewBox="0 0 48 20" aria-hidden="true">
              <path d="M2 10h42m-8-7 8 7-8 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <span>Lifted 3D representation</span>
            <strong>(x₁, x₂, z)</strong>
            <span>({x1}, {x2}, {z})</span>
          </div>
        </div>
        <figcaption className="lifting-equation">
          <span>φ(x₁, x₂) = </span><span>(x₁, x₂, x₁² + x₂²)</span>
        </figcaption>
      </figure>
      <p>The first two coordinates remain unchanged. We simply add a third coordinate calculated from them. This gives us a new representation of the same observation using the two original measurements.</p>
    </section>
    <p>We can calculate different features from the same original coordinates. Different transformations reveal different patterns. A useful transformation is one that helps distinguish the classes we're trying to separate.</p>
    <p className="chapter-handoff">Now let’s see what happens when we apply this idea to every point in our dataset.</p>
  </div>
}

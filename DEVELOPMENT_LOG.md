# Development log

## Chapter 1 foundation

- Initialized a React and TypeScript application with Vite, using SVG and plain CSS. Vitest provides mathematical tests. Vite uses relative asset paths for later GitHub Pages deployment.
- Built a responsive Chapter 1 page with an SVG scatter plot, boundary sliders, accuracy, reset, and an interaction-gated explanation. Future chapter navigation is a placeholder.
- The fixed-seed dataset contains 40 inner points and 60 angularly stratified ring points. It is generated independently of React so future chapters can reuse the same observations.
- The classifier uses `cos(θ)x₁ + sin(θ)x₂ − d`, predicting Class 1 for nonnegative values. A parametric line is clipped against the plot rectangle; the square plot uses equal bounds on both axes.
- Tests cover deterministic generation, class counts, radial separation, geometric enclosure, predictions, accuracy, parameter changes, and line clipping. The geometric check verifies that every inner point lies on the interior side of each edge of the outer polygon, supporting the lack of a separating line.
- The explanation remains unlocked after a reset once the learner has moved a slider. Future chapters and direct manipulation are intentionally not implemented.
- Validation: `npm test` passed all five tests and `npm run build` passed. The initial dependency install reported security advisories; development tools were updated, and the install still reported six high-severity advisories. The first Vitest update also flagged a Node engine mismatch, so Vitest was set to version 4.1.12, which runs on the installed Node version.

## Chapter 2A: 3D visualization foundation

- Added Three.js 0.170, React Three Fiber 8, Drei 9.121, and matching Three.js TypeScript declarations. Fiber 8 pairs with the existing React 18 renderer.
- Added Chapter 2, a reusable typed 3D scatter plot, and labeled 3D axes. Chapter 2 shares the original concentric dataset and class colors with Chapter 1, and reuses the 2D scatter plot with its optional decision boundary omitted.
- Chapter navigation works in both directions, and Chapter 1's explanation provides a Continue to Chapter 2 button. Keeping Chapter 1 mounted preserves the sliders and explanation state across chapter switches.
- Data preparation copies each observation and appends mathematical height `z = 0`. The renderer maps mathematical `(x1, x2, z)` to Three.js world `(x1, z, -x2)`. World Y is up and negating world Z preserves handedness. Axis endpoints and marker centers use the same conversion and unit scale.
- Drei OrbitControls provides rotation, bounded zoom, and a camera reset. The plots stack on narrow screens.
- All seven tests passed, including two checks covering the original observations, zero height, and signed coordinate mapping. The production build passed. Vite reported a large JavaScript chunk after adding the 3D renderer. npm reported six high-severity advisories and a deprecation warning for Drei's transitive `three-mesh-bvh` dependency.
- Chrome displayed both Chapter 2 plots and the labeled 3D scene. Browser automation could not reliably deliver pointer gestures, so interactive orbit, zoom, and reset remain unverified in the browser.

## Chapter 2B: interactive feature transformations

- Added a selector for Original (`z = 0`), Linear (`z = x1 + x2`), Interaction (`z = x1 * x2`), and Radial quadratic (`z = x1² + x2²`). The equation and explanation update with the selection. Heights are always computed from the original 100 observations, and the 2D plot continues to use that original dataset.
- Each feature surface uses a 48 × 48 grid of triangulated cells over `[-3, 3] × [-3, 3]`. The same equation computes each mesh vertex and every marker height. The surface is translucent, and markers are drawn afterward so both classes stay visible. Replaced surface geometry is disposed.
- Retained unit scale on all axes and the mathematical-to-world mapping `(x1, x2, z) → (x1, z, -x2)`. Camera framing uses the horizontal domain and vertical extent, including the radial surface corners at `z = 18`. Changing the transformation establishes a new default orbit target and zoom for Reset Camera.
- All 17 tests passed, including signed numerical examples, preservation of observations, radial symmetry and nonnegativity, and equation checks for every mesh vertex and transformed observation. The production build passed with the existing bundle-size warning. Chrome displayed Chapter 2 in Original mode. A capture failure and a foreground tab change interrupted the remaining interactive browser checks.

## Chapter 2C: interactive feature lifting

- Added a 0–100% slider, 1.8-second playback using `requestAnimationFrame`, and Reset Lifting. Scrubbing, resetting, or selecting a different feature cancels playback. Changing features starts the new lift at zero.
- Marker centers and surface vertices share `displayedHeight`, which computes `t * g(x1, x2)` while preserving the original horizontal coordinates. The surface reuses its vertex buffer during playback and updates normals and bounds as its heights change. Camera framing uses the full feature extent so scrubbing preserves the orbit view.
- Both plots select observations by their original ID and highlight the same point with its class color and a dark outline. The coordinate panel reports the full feature value separately from the current height. The 3D click handler ignores drags.
- All 22 tests passed, including progress endpoints and midpoint, surface interpolation, and selected-point identity across transformations. The production build passed with the existing bundle-size warning.
- Safari verified 2D selection and its persistence when switching to the radial feature. Playback entered its playing state, but progress stayed at zero in the automation session. Chrome capture failed and Safari pointer input was unavailable for subsequent checks, so playback, scrubbing, and 3D picking were not verified end to end.

## Chapter 3A: horizontal separating plane

- Added Chapter 3 to the existing navigation, with Continue from Chapter 2 and Back to Chapter 2. The chapter reuses the original observations, 2D plot, 3D scatter plot, and fully lifted radial surface.
- Added a translucent purple plane parallel to the mathematical x1-x2 plane. Its position uses the shared world mapping, so mathematical height `c` is Three.js world Y. The plane renders after the feature surface and before the point markers, with depth writes disabled and polygon offset for its overlap with the grid at zero.
- The slider covers `c = 0` to `c = 7` and starts at `0.40`. The classifier scores each fully lifted observation with `z - c`, breaks ties in favor of Class 1, and reports the count and percentage from the original labels. The score, sign rule, and summary are reusable independently of the camera.
- All 26 tests passed. The new tests cover radial heights, threshold and tie behavior, counts at both slider limits, perfect accuracy in the class gap, and coordinate mapping independent of view rotation. The production build passed with the existing bundle-size warning.
- In Safari, moving the slider from `0.40` to `1.97` visibly raised the plane and changed accuracy from 88/100 to 100/100. Verified both the Back and Continue transitions.

## Chapter 3B: synchronized decision boundaries

- The plane height drives the classifier, the 3D intersection, the projected 2D boundary, and the live equations. For positive height, the shared radius is `sqrt(c)`. At zero the views show the origin, and below zero the chapter explains why there is no real intersection. The slider extends to `-0.50` so readers can explore that case.
- The 3D curve uses 128 angular segments at the exact feature height, with the final vertex repeating the first to close the curve. It uses the shared world-coordinate conversion and draws between the translucent plane and the point markers.
- The SVG circle uses the same conversion and scale as the observations, preserves its aspect ratio, and is clipped to the plotting rectangle. Its outline is drawn behind the points.
- All 35 tests passed, including positive, zero, and negative heights, both 3D equations, projection into SVG coordinates, and the inside/on/outside classification rule. The production build passed with the existing bundle-size warning.
- Safari displayed the 2D boundary and the live radius at the initial height. Browser pointer input failed during the slider check, so the synchronized change was not verified end to end in Safari.

## Chapter 3C: water-level analogy

- Added a Chapter 3 view switcher. Both views share one height value and a single radial intersection result, so the selected height carries between views.
- The analogy reuses the radial feature mesh, intersection rim, and original SVG projection. A translucent blue disk sits at world Y = c and uses the same radius and segment count as the rim. At zero the shared intersection is a point, and below zero the display explains the absence of a real intersection.
- Added Perspective, Top View, and Side View pose presets for the analogy, using an orthographic camera so the top projection uses equal scale. The same OrbitControls handle manual rotation and zoom, and Reset Camera restores the last preset. Added three guided explanation stages.
- All 38 tests passed. Added tests comparing the disk plane, sampled rim, feature equation, and SVG projection at heights 1 and 4, plus the zero and negative cases. The production build passed with the existing bundle-size warning.
- Safari showed the circular top projection, advanced the guide, and updated the water height from 0.40 to 3.25 with the radius changing to 1.803. Switching back preserved 3.25 and showed 100% accuracy. After the slider adjustment the Safari automation capture retained the previous 3D frame, so the moved water disk and Side View were not confirmed visually in that run.

## Chapter 4A: the tilt challenge

- Added Chapter 4 navigation, a Continue control in Chapter 3, and Exercise 1. The shifted dataset translates all existing observations by (1.0, 0.7), preserving IDs, labels, and relative positions. The 2D and 3D plots use a square domain from −4 to 4 on each input axis.
- The exercise begins with the height slider. Try Tilting the Plane unlocks the two slope sliders. One set of coefficients drives the live score, accuracy, equations, plane, and both boundaries.
- The 3D plane evaluates `z = a*x1 + b*x2 + c` at its four corners and updates a reusable vertex buffer. The projected circle uses center `(a/2, b/2)` and squared radius `c + (a² + b²)/4`. The sampled rim reuses the radial intersection sampler and places each shifted vertex at its exact plane height. The existing SVG conversion, plot clipping, and classifier summary are shared.
- All 45 tests passed. Tests cover the translation, absence of a perfect horizontal threshold, projection and plane equations, degenerate intersections, signed classification, and a reference configuration that correctly classifies all 100 observations. The production build passed with the existing bundle-size warning.
- Safari verified Chapter 3's Continue control, the height-only initial state, and the tilt-control unlock. Subsequent pointer input failed, so slider-driven motion in the browser was not verified end to end.

## Chapter 4B: XOR challenge

- Added Exercise 2 alongside the Tilt Challenge. The seeded dataset reflects 20 sampled magnitude pairs across all four quadrants, yielding 80 observations with 40 per class. Every point has both coordinate magnitudes between 0.7 and 2.2, and its label follows the sign of the product.
- The exercise reuses the feature registry, SVG and 3D plots, sampled feature surface, horizontal plane, and classification summary. Each transformation starts at `c = 0` and has slider limits that extend beyond its observed heights. The comparison uses `g(x1, x2) - c`, with ties assigned to Class 1. Intersection curves are omitted because the three features produce different intersection geometries.
- Check My Solution gives success or retry feedback and unlocks the explanation. The explanation uses an exhaustive search over gaps between distinct heights and thresholds outside the observed range. On the generated dataset, Linear peaks at 75%, Radial quadratic at 50%, and Interaction at zero gives 80/80.
- All 51 tests and the production build passed. Vite reported the existing bundle-size warning. Safari verified exercise navigation, retry feedback, the unlocked explanation, and the 80/80 success state. Pointer input failed during the off-zero slider check.

## Chapter 5A: intertwined spirals

- Added Chapter 5 navigation and the spiral challenge. The dataset has 72 observations per arm at angles `t = iπ/16` for `i = 0…71`. The radius is `0.35 + 0.175t`, and the second arm is offset by π. Both arms wind more than twice, fit inside the existing plot domain, and use no random perturbation.
- Extracted the shared horizontal-feature challenge from XOR so both chapters use the same transformation selector, sampled surface, adjustable plane, and live score. Chapter 5 adds Reset and keeps solution feedback focused on the current attempt.
- Validation confirmed unique IDs, equal class counts, increasing radial distance, and a minimum cross-arm sample distance above 0.4 units. Two chords from opposite classes cross in their interiors, proving that the original 2D class hulls intersect. Exhaustive tests checked every distinct threshold partition for all three transformed features and found no perfect horizontal classifier.
- All 57 tests passed, and the production build passed with the existing bundle-size warning. Safari showed both plots and verified feature selection, a plane-height change, retry feedback, and Reset. The Interaction score stayed at 50% after the height change because each antipodal pair has equal interaction height and opposite labels.

## Chapter 5B: general-plane feasibility and conclusion

- The offline audit uses the original 144 observations and three height functions imported directly from the app by the TypeScript exporter. The result artifact records a SHA-256 digest of that export, including IDs, coordinates, labels, and computed heights. No Python copy of the generator is maintained.
- SciPy 1.17.1 calls HiGHS through `linprog(method="highs")`. It appends a column of ones for the intercept, converts the labels with `y = 2 * label - 1`, and solves `-y_i [x1_i, x2_i, g_i, 1] · [w1, w2, w3, b] <= -1` with all coefficients unbounded. For the original 2D audit, the third feature column is omitted. Inconclusive statuses are distinct from infeasibility.
- The solver used primal and dual feasibility tolerances of `1e-9`. Each feasible candidate was reevaluated against the signed constraints with verification tolerance `1e-8`. The 2D separable and interaction-lifted XOR controls were feasible with minimum margin 1. Original XOR and the original spirals were infeasible. All three lifted spiral mappings returned SciPy status 2, infeasible.
- Chapter 5 renders the saved result table and adds concise sections on selecting expressive features, overfitting, and the explainer’s main takeaway. The website remains static.
- The default shell Python lacked SciPy, so the audit used the installed Anaconda interpreter. The TypeScript build initially lacked Node declarations for the test's crypto import. The digest test now uses Web Crypto without adding a dependency. An identical rerun generated a byte-for-byte matching artifact.
- All 61 tests passed. The production build passed with the existing bundle-size warning. Safari confirmed the table, Chapter 5 feature selection, plane slider, attempt feedback, and navigation to Chapters 1–4.

To regenerate from the project root, use Node 22.18 or later and a Python environment with NumPy and SciPy installed. The checked-in artifact was generated with Node 25.6.1 and SciPy 1.17.1.

```sh
set -o pipefail
node scripts/export_spiral_audit.ts | python scripts/audit_spiral_feasibility.py src/data/spiral_feasibility_results.json
```

## Continuous story refactor, Pass A

- App now renders the five chapter sections in order with stable anchors and visible narrative handoffs. Sticky chapter links use native scrolling with a header offset and reduced-motion support. An IntersectionObserver tracks the chapter at the reading line below the sticky bar and is disconnected on cleanup.
- Chapter 3 presents the classifier and its equations before the water-level activity. Both visible sliders reuse the existing Chapter 3 height state. Chapter 4 presents the tilt and XOR exercises consecutively, with each exercise retaining its local state.
- The page contains six 3D scenes. Plot containers reserve their space, while WebGL canvases mount near the viewport and unmount farther away. The demand frame loop remains in use. Camera position and zoom are saved for a return to the same framing and preset.
- Safari verified the document order, the Chapter 3 and Chapter 5 anchor destinations and active markers, and the shared Chapter 3 height control. The 3D area appeared blank in the Safari automation capture both before and after viewport-based mounting, and Chrome capture did not produce a usable preview. Visual WebGL behavior and narrow-screen layout were not fully verified.
- All 61 tests passed and the production build passed with the existing bundle-size warning.

## Continuous story refactor, Pass B

- Added a session-scoped progression reducer. Chapter 1 starts unlocked. Moving a boundary control enables the explanation, and the explicit Continue unlocks Chapters 2–4. Chapters 2 and 3 remain free to explore without checkpoints.
- An explicit XOR feature selection followed by Check My Solution enables Continue to Limitations. In Chapter 5, selecting a feature or adjusting the plane and then checking the solution enables See What We Learned. The feasibility audit is visible before the conclusion unlocks.
- Locked markers have no navigation target, and locked chapter sections stay unmounted. Explicit Continue and conclusion actions focus and scroll to the destination after React renders it. The existing reduced-motion rule governs scrolling. Unlocks are monotonic during the page session, and earlier activities stay mounted.
- All 67 tests passed, including six new progression and rendering tests. The production build passed with the existing bundle-size warning. Safari verified the three checkpoints, progressing with an imperfect XOR score, seeing the audit before the conclusion, and returning to the original Chapter 1 settings with all unlocks intact. One Safari capture failed after the first Continue click, and a subsequent accessibility read confirmed the expected unlock.

## Continuous story refactor, Pass C

- Confirmed Chapters 1–3 and the water analogy import the same module-level concentric dataset. Chapter 1 owns its line settings. Chapter 2 owns its feature selection, lifting progress, playback, and point selection. Chapter 3 explicitly introduces the radial quadratic feature on the same observations and owns the height shared by both of its demonstrations.
- The tilt exercise owns its plane coefficients. XOR and the spiral challenge each own their dataset, feature, plane height, and feedback. Switching features in either challenge now preserves the height, using a single slider range per dataset that covers all three features. The 3D framing includes that range so sliding the plane does not reframe the camera.
- App continues to own progression and active navigation. Unlocked sections stay mounted. Only offscreen WebGL canvases are suspended, with the existing per-plot camera snapshots retained for matching framing and presets.
- Safari confirmed the Chapter 2 transformation and selected point survived navigation, both Chapter 3 sliders reported the same changed height, and changing the XOR mapping preserved its nonzero height while the spiral and Chapter 3 settings stayed independent. Safari exposed the unlocked tilt controls but did not register a nonzero tilt adjustment in this check. All 67 tests passed and the production build passed with the existing bundle-size warning.

## Dark editorial redesign, Phase 1

- Began on a clean `design/editorial-dark` branch. Updated `src/styles/global.css` with navy page and raised surfaces, high-contrast text, shared control states, a restrained sticky progress bar, and equation/table styling. Typography uses Georgia headings, system sans-serif for text and controls, and system monospace for plot labels.
- Centralized visualization colors in `src/components/classColors.ts` and exposed shared colors to CSS through `App.tsx`. Both plots use lighter blue for Class 0, orange for Class 1, and lavender for boundaries. Updated the 2D grid and selection outline, the 3D canvas background and axes, and existing surface, plane, and water materials. The shared challenge uses a teal success message with the existing text feedback.
- All 67 tests passed, the production build passed with the existing bundle-size warning, and the diff whitespace check passed. Safari screenshots confirmed the theme, navigation contrast, and 2D plot styling in Chapters 1 and 2. Safari showed the 3D background and axis labels with no visible scene geometry in the capture, consistent with prior automation captures. Full 3D contrast, Chapters 3–5 visually, and narrow-screen rendering were not verified in this browser check.

## Light editorial redesign

- Updated the prior uncommitted design work on `design/editorial-dark`. The light theme changes `src/styles/global.css` and the shared SVG and WebGL palette in `src/components/classColors.ts`.
- Used warm paper (#FAF9F6), white plots, pale blue-gray control surfaces, slate text, and soft dividers. The shared plot colors use blue (#397AB9), orange (#C47740), and purple (#8258AC), with contrast ratios of 4.51:1, 3.47:1, and 5.33:1 against white. Main and secondary text achieve 13.94:1 and 5.99:1 against the page background.
- Retained Georgia, system sans-serif, and monospace plot labels. Increased the desktop maximum width to 1440px and used a 5:3 plot-to-controls split in Chapter 1. Linked plots remain two-column on wide screens and stack below 700px. Replaced the fieldset boxes with simple dividers.
- All 67 tests and the production build passed, with the existing bundle-size warning. Safari screenshots confirmed the light presentation in all five chapters and the compact navigation and single-column Chapter 1 layout at increased browser zoom. Safari verified the Chapter 1 and XOR progression controls. The 3D areas remained blank in those captures, so visual contrast of rendered WebGL geometry was not verified.

## Chapter 1 storytelling redesign

- Added an editorial opening, a Begin Exploring anchor, and a larger challenge plot with both sliders and Reset immediately below it. The instructions and live score sit alongside the plot on desktop, and the layout stacks on narrow screens.
- A slider change enables Continue Exploring. That action reveals the discovery and requests a post-render focus and scroll. Let's Add Another Dimension separately unlocks Chapter 2 and continues the story. Chapter 1 keeps its existing dataset, classifier, boundary values, and session progression.
- The discovery starts at partial opacity and uses a short entrance transition, which is skipped for reduced motion. Safari initially captured an empty discovery area when the entrance started at zero opacity, so the starting opacity was raised to keep the content visible.
- Safari verified the opening anchor, both line sliders, a score change from 50% to 55%, the discovery reveal, the Chapter 2 unlock, and returning to the adjusted Chapter 1 rotation. All 68 tests passed, the production build passed with the existing bundle-size warning, and the diff whitespace check passed.

## Chapter 1 layout and navigation refinement

- Removed the five-chapter bar and its scroll observer. Narrative actions still unlock and scroll to the same destinations. Begin Exploring now targets the entire challenge workspace, with a smaller scroll offset because there is no sticky bar.
- Aligned the Chapter 1 label with the top of the plotting area, used a 60/40 desktop grid, and bounded the SVG size relative to viewport height. The square viewBox and coordinate mapping are unchanged. The two numerical sliders and Reset remain in one strip under the plot. The workspace stacks at narrow widths.
- All 68 tests passed, the production build passed with the existing bundle-size warning, and the diff whitespace check passed. Safari confirmed the bar was gone, the plot and controls fit together in the desktop capture, the narrow layout stacked, and rotation and Reset changed the control values. Safari pointer automation failed when trying to set a nonzero position, so a live accuracy change was not reproduced in this pass.

## Chapter 1 natural scroll flow

- Removed the Chapter 1 reveal and Continue actions. The line explanation and new feature question now follow the challenge in the initial document, with no reveal animation or scroll triggered by a slider.
- Chapters 1–4 are available from the start because the former Chapter 1 checkpoint unlocked Chapters 2–4 together. The existing XOR checkpoint still unlocks Chapter 5, and the spiral checkpoint still controls the conclusion.
- Updated progression tests to verify the order of the hero, challenge, explanation, transition, and Chapter 2 in initial markup. All 67 tests passed, the production build passed with the existing bundle-size warning, and the diff check passed.
- Safari confirmed normal scrolling from the untouched challenge through the explanation into Chapter 2. Returning to the challenge and moving the rotation slider still worked.

## Chapter 2 conceptual introduction

- Added a short bridge ahead of the interactive plots. The scalar example distinguishes the original value from its square, and the coordinate example uses the existing radial transformation to compute the lifted representation of (1, 2).
- The diagram uses HTML labels and a decorative SVG arrow, with a stacked layout below 560px. It introduces the mapping before learners see the 3D activity. No new WebGL scene or dependencies were added.
- Safari confirmed the example values, desktop diagram, and ordering before the plots. Selecting Radial quadratic and scrubbing to 50% still worked. The stacked diagram and full 3D playback were not visually verified. All 67 tests passed, the production build passed with the existing bundle-size warning, and the diff check passed.

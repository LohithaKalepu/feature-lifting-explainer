import { plotThemeVariables } from '../components/classColors'
import { type CSSProperties } from 'react'
import { Chapter1 } from '../chapters/Chapter1'
import { Chapter2 } from '../chapters/Chapter2'
import { Chapter3 } from '../chapters/Chapter3'
import { Chapter4 } from '../chapters/Chapter4'
import { Chapter5 } from '../chapters/Chapter5'

export default function App() {
  return <div className="app" style={plotThemeVariables as CSSProperties}>
    <header className="story-introduction">
      <h1>Feature Lifting</h1>
      <p className="introduction-subtitle">When straight lines become curves.</p>
      <p>Machine learning models can learn complicated decision boundaries. But what if we wanted to keep the classifier simple?</p>
      <p>In this explainer, we'll focus on linear classifiers. They separate data with a straight line in two dimensions or a flat plane in three dimensions. We'll see how changing the data representation can give these classifiers nonlinear boundaries in the original input space.</p>
      <p>Let's begin with one dataset. Blue points cluster near the center, and orange points surround them in a ring. In Chapters 1–3, we'll keep these same observations as we explore different ways of representing them.</p>
      <a className="introduction-link" href="#chapter-one-challenge">Begin Exploring</a>
    </header>
    <main className="story">
      <Chapter1 />
      <Chapter2 />
      <Chapter3 />
      <Chapter4 />
      <Chapter5 />
    </main>
  </div>
}

import { memo, useId } from 'react'
import type { Boundary, Bounds, DataPoint, Point2D } from '../types'
import { classColors, intersectionColor, plotColors } from './classColors'
import { circleToSvg, clipBoundary, toSvg } from '../math/coordinateTransforms'

const defaultBounds: Bounds = { minX: -3, maxX: 3, minY: -3, maxY: 3 }
const size = 500, padding = 42
const concentricLabels = ['Class 0 (inner)', 'Class 1 (outer)'] as const

export const ScatterPlot2D = memo(function ScatterPlot2D({ points, boundary, circularRadius, circularCenter = { x: 0, y: 0 }, bounds = defaultBounds, selectedId, onSelect,
  plotTitle = 'Concentric classes',
  plotDescription = 'Blue class zero points are in the center; orange class one points surround them.',
  classLabels = concentricLabels, }: {
  points: DataPoint[]
  boundary?: Boundary
  circularRadius?: number
  circularCenter?: Point2D
  bounds?: Bounds
  selectedId?: string
  onSelect?: (id: string) => void
  plotTitle?: string
  plotDescription?: string
  classLabels?: readonly [string, string]
}) {
  const titleId = useId()
  const descriptionId = useId()
  const clipId = useId()
  const circle = circularRadius === undefined ? undefined : circleToSvg(circularCenter, circularRadius, bounds, size, padding)
  const line = boundary && clipBoundary(boundary, bounds)?.map(point => toSvg(point, bounds, size, padding))
  const origin = toSvg({ x: 0, y: 0 }, bounds, size, padding)
  const selected = points.find(point => point.id === selectedId)
  const highlight = selected && toSvg({ x: selected.x1, y: selected.x2 }, bounds, size, padding)
  const ticks = Array.from({ length: bounds.maxX - bounds.minX + 1 }, (_, index) => bounds.minX + index)
  return <figure className="plot">
    <svg preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${size} ${size}`} role={onSelect ? "group" : "img"} aria-labelledby={`${titleId} ${descriptionId}`}>
      <title id={titleId}>{plotTitle}{(boundary || circle) && ' and decision boundary'}</title>
      <desc id={descriptionId}>{plotDescription}{boundary && ' The purple line is the current decision boundary.'}{circle && (circle.radius === 0 ? ' The purple marker shows a single-point boundary.' : ' The purple circle is the projected decision boundary.')}</desc>
      <rect x={padding} y={padding} width={size - 2 * padding} height={size - 2 * padding} fill={plotColors.background} stroke={plotColors.grid} />
      {ticks.filter(tick => tick !== 0).map(tick => {
        const p = toSvg({ x: tick, y: tick }, bounds, size, padding)
        return <g key={tick} stroke={plotColors.grid} opacity="0.55">
          <line x1={p.x} x2={p.x} y1={padding} y2={size - padding} />
          <line x1={padding} x2={size - padding} y1={p.y} y2={p.y} />
        </g>
      })}
      <line x1={padding} y1={origin.y} x2={size - padding} y2={origin.y} stroke={plotColors.axis} />
      <line x1={origin.x} y1={padding} x2={origin.x} y2={size - padding} stroke={plotColors.axis} />
      {ticks.map(tick => {
        const p = toSvg({ x: tick, y: tick }, bounds, size, padding)
        return <g key={tick} className="tick"><text x={p.x} y={size - padding + 18} textAnchor="middle">{tick}</text><text x={padding - 10} y={p.y + 4} textAnchor="end">{tick}</text></g>
      })}
      <text x={size - padding} y={size - 8} textAnchor="end" className="axis-label">x₁</text>
      <text x={padding} y={padding - 12} className="axis-label">x₂</text>
      {circle && <>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={padding} y={padding} width={size - 2 * padding} height={size - 2 * padding} />
        </clipPath>
        <circle clipPath={`url(#${clipId})`} pointerEvents="none" cx={circle.center.x} cy={circle.center.y} r={circle.radius || 3}
          fill={circle.radius === 0 ? intersectionColor : 'none'} stroke={intersectionColor} strokeWidth="2.5" />
      </>}
      {points.map(point => {
        const p = toSvg({ x: point.x1, y: point.x2 }, bounds, size, padding)
        return <circle key={point.id} cx={p.x} cy={p.y} r="4" fill={classColors[point.label]}
          className={onSelect ? 'selectable-point' : undefined}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-pressed={onSelect ? point.id === selectedId : undefined}
          aria-label={onSelect ? `Class ${point.label} point (${point.x1.toFixed(3)}, ${point.x2.toFixed(3)})` : undefined}
          onClick={onSelect && (() => onSelect(point.id))}
          onKeyDown={onSelect && (event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(point.id)
            }
          })} />
      })}
      {selected && highlight && <circle cx={highlight.x} cy={highlight.y} r="6"
        fill={classColors[selected.label]} stroke={plotColors.selection} strokeWidth="2" pointerEvents="none" />}
      {line && <line x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} stroke={intersectionColor} strokeWidth="2.5" />}
    </svg>
    <figcaption className="legend"><span><i className="dot blue" /> {classLabels[0]}</span><span><i className="dot orange" /> {classLabels[1]}</span>{boundary && <span><i className="line-key" /> Decision boundary</span>}{circle && <span><i className="line-key" style={{ borderColor: intersectionColor }} /> Projected decision boundary</span>}</figcaption>
  </figure>
})

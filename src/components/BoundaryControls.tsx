import type { Boundary } from '../types'

export function BoundaryControls({ boundary, onChange, onReset }: { boundary: Boundary; onChange: (value: Boundary) => void; onReset: () => void }) {
  return <div className="controls">
    <label htmlFor="angle">Rotation θ <output>{Math.round(boundary.angle * 180 / Math.PI)}°</output></label>
    <input id="angle" type="range" min="0" max="360" step="1" value={Math.round(boundary.angle * 180 / Math.PI)} onChange={event => onChange({ ...boundary, angle: Number(event.target.value) * Math.PI / 180 })} />
    <label htmlFor="offset">Position d <output>{boundary.offset.toFixed(2)}</output></label>
    <input id="offset" type="range" min="-3" max="3" step="0.05" value={boundary.offset} onChange={event => onChange({ ...boundary, offset: Number(event.target.value) })} />
    <p className="hint">The angle sets the direction perpendicular to the line. Position moves the line along that direction.</p>
    <button type="button" onClick={onReset}>Reset boundary</button>
  </div>
}

import { plotColors } from './classColors'
import { Html, Line } from '@react-three/drei'
import { toWorldPosition, type Coordinates3D } from '../math/coordinates3D'

export function CoordinateAxes3D({ radius, minZ, maxZ }: { radius: number; minZ: number; maxZ: number }) {
  const axes: { label: string; start: Coordinates3D; end: Coordinates3D }[] = [
    { label: 'x₁', start: { x1: -radius, x2: 0, z: 0 }, end: { x1: radius, x2: 0, z: 0 } },
    { label: 'x₂', start: { x1: 0, x2: -radius, z: 0 }, end: { x1: 0, x2: radius, z: 0 } },
    { label: 'z', start: { x1: 0, x2: 0, z: minZ }, end: { x1: 0, x2: 0, z: maxZ } },
  ]

  return <>
    <gridHelper args={[2 * radius, 6, plotColors.axis, plotColors.grid]} />
    {axes.map(({ label, start, end }) => {
      const endpoint = toWorldPosition(end)
      return <group key={label}>
        <Line points={[toWorldPosition(start), endpoint]} color={plotColors.axis} />
        <Html position={endpoint} center style={{ pointerEvents: 'none' }}>
          <span className="axis-label-3d">{label}</span>
        </Html>
      </group>
    })}
  </>
}

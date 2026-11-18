import { Line } from '@react-three/drei'
import { toWorldPosition, type Coordinates3D } from '../math/coordinates3D'
import { intersectionColor } from './classColors'

export function IntersectionCurve3D({ points }: { points: readonly Coordinates3D[] }) {
  if (points.length === 0) return null
  if (points.length === 1) {
    return <mesh position={toWorldPosition(points[0])} renderOrder={1}>
      <sphereGeometry args={[0.045, 12, 8]} />
      <meshBasicMaterial color={intersectionColor} transparent depthTest={false} depthWrite={false} />
    </mesh>
  }

  return <Line points={points.map(toWorldPosition)} color={intersectionColor}
    lineWidth={2.5} renderOrder={1.5} transparent depthWrite={false}
    polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
}

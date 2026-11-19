import { plotColors } from './classColors'
import { DoubleSide } from 'three'
import { horizontalPlanePosition } from '../math/coordinates3D'
import { radialIntersectionSegments } from '../math/radialIntersection'

export function WaterSurface3D({ height, radius }: { height: number; radius: number }) {
  return <mesh position={horizontalPlanePosition(height)} rotation={[-Math.PI / 2, 0, 0]}
    scale={[radius, radius, 1]} renderOrder={1}>
    <circleGeometry args={[1, radialIntersectionSegments]} />
    <meshBasicMaterial color={plotColors.water} side={DoubleSide} transparent opacity={0.48} depthWrite={false} />
  </mesh>
}

import { DoubleSide } from 'three'
import { horizontalPlanePosition } from '../math/coordinates3D'

export function SeparatingPlane3D({ height, radius }: { height: number; radius: number }) {
  return <mesh position={horizontalPlanePosition(height)} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
    <planeGeometry args={[2 * radius, 2 * radius]} />
    <meshBasicMaterial color="#8254a6" side={DoubleSide} transparent opacity={0.34}
      depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
  </mesh>
}

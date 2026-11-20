import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { intersectionColor } from './classColors'
import { DoubleSide } from 'three'
import { horizontalPlanePosition } from '../math/coordinates3D'

export function SeparatingPlane3D({ height, radius, outlined = false }: { height: number; radius: number; outlined?: boolean }) {
  const outline = useMemo<[number, number, number][]>(() => [
    [-radius, -radius, 0], [radius, -radius, 0], [radius, radius, 0], [-radius, radius, 0], [-radius, -radius, 0],
  ], [radius])
  return <mesh position={horizontalPlanePosition(height)} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
    <planeGeometry args={[2 * radius, 2 * radius]} />
    {outlined && <Line color={intersectionColor} lineWidth={1.5} renderOrder={1.25}
      transparent opacity={0.75} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1}
      points={outline} />}
    <meshBasicMaterial color={intersectionColor} side={DoubleSide} transparent opacity={0.34}
      depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
  </mesh>
}

import { useLayoutEffect, useRef } from 'react'
import { DoubleSide, type BufferAttribute } from 'three'
import { toWorldPosition } from '../math/coordinates3D'
import { planeHeightAt, type FeaturePlane } from '../math/featureClassifier'

const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const triangles = [0, 1, 2, 0, 2, 3]

export function TiltedPlane3D({ plane, radius }: { plane: FeaturePlane; radius: number }) {
  const positions = useRef<BufferAttribute>(null)
  const initialPositions = useRef(new Float32Array(triangles.length * 3))

  useLayoutEffect(() => {
    const attribute = positions.current
    if (!attribute) return
    triangles.forEach((corner, index) => {
      const [u, v] = corners[corner]
      const x1 = u * radius
      const x2 = v * radius
      attribute.setXYZ(index, ...toWorldPosition({ x1, x2, z: planeHeightAt(x1, x2, plane) }))
    })
    attribute.needsUpdate = true
  }, [plane, radius])

  return <mesh renderOrder={1} frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute ref={positions} attach="attributes-position" args={[initialPositions.current, 3]} />
    </bufferGeometry>
    <meshBasicMaterial color="#8254a6" side={DoubleSide} transparent opacity={0.34}
      depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
  </mesh>
}

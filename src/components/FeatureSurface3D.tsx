import { useEffect, useLayoutEffect, useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from 'three'
import { toWorldPosition } from '../math/coordinates3D'
import { displayedHeight, type FeatureSurfaceData } from '../math/featureTransforms'

export function FeatureSurface3D({ surface, progress }: { surface: FeatureSurfaceData; progress: number }) {
  const geometry = useMemo(() => {
    const meshGeometry = new BufferGeometry()
    meshGeometry.setAttribute('position', new Float32BufferAttribute(surface.vertices.flatMap(toWorldPosition), 3))
    meshGeometry.setIndex(surface.indices)
    return meshGeometry
  }, [surface])

  useLayoutEffect(() => {
    const positions = geometry.getAttribute('position')
    surface.vertices.forEach(({ z }, index) => positions.setY(index, displayedHeight(z, progress)))
    positions.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
  }, [geometry, progress, surface])

  useEffect(() => () => geometry.dispose(), [geometry])

  return <mesh>
    <primitive object={geometry} attach="geometry" />
    <meshLambertMaterial color="#60999b" side={DoubleSide} transparent opacity={0.36} depthWrite={false} />
  </mesh>
}

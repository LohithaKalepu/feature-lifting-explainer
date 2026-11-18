import { useEffect, useLayoutEffect, useRef, useState, type ComponentRef, type MutableRefObject, type RefObject } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { BackSide, MathUtils, OrthographicCamera, Vector3 } from 'three'
import { toWorldPosition, type Coordinates3D, type DataPoint3D } from '../math/coordinates3D'
import { observationAtProgress, type FeatureSurfaceData } from '../math/featureTransforms'
import { classColors } from './classColors'
import { CoordinateAxes3D } from './CoordinateAxes3D'
import { FeatureSurface3D } from './FeatureSurface3D'
import { IntersectionCurve3D } from './IntersectionCurve3D'
import { SeparatingPlane3D } from './SeparatingPlane3D'
import type { FeaturePlane } from '../math/featureClassifier'
import { TiltedPlane3D } from './TiltedPlane3D'
import { WaterSurface3D } from './WaterSurface3D'

type OrbitControlsRef = RefObject<ComponentRef<typeof OrbitControls>>

const fieldOfView = 44
const markerSize: [number, number, number] = [0.065, 12, 8]
const viewDirection = new Vector3(5, 7, 7).normalize()

const cameraPresets = {
  Perspective: viewDirection,
  'Top View': new Vector3(0, 1, 0),
  'Side View': new Vector3(0, 0, 1),
}
type CameraPreset = keyof typeof cameraPresets

interface CameraSnapshot {
  position: Vector3
  zoom: number
  framing: string
  preset?: { view: CameraPreset }
}

function PlotCamera({ controls, radius, minZ, maxZ, preset, savedCamera }: {
  controls: OrbitControlsRef
  savedCamera: MutableRefObject<CameraSnapshot | undefined>
  radius: number
  minZ: number
  maxZ: number
  preset?: { view: CameraPreset }
}) {
  const camera = useThree(state => state.camera)
  const viewportHeight = useThree(state => state.size.height)
  const invalidate = useThree(state => state.invalidate)
  const halfHeight = (maxZ - minZ) / 2
  const boundingRadius = Math.hypot(radius, radius, halfHeight)
  // The viewport is square. Fit an enclosing sphere so orbiting keeps the
  // same geometry in view at the default zoom.
  const distance = 1.08 * boundingRadius / Math.sin(MathUtils.degToRad(fieldOfView / 2))

  const orthographic = camera instanceof OrthographicCamera
  const zoom = orthographic
    ? viewportHeight / (2.18 * (preset?.view === 'Top View' ? radius : boundingRadius))
    : 1
  const framing = `${radius}:${minZ}:${maxZ}:${zoom}`

  useLayoutEffect(() => {
    const orbit = controls.current
    if (!orbit) return

    const previous = savedCamera.current
    orbit.target.set(...toWorldPosition({ x1: 0, x2: 0, z: minZ + halfHeight }))
    camera.position.copy(orbit.target).addScaledVector(preset ? cameraPresets[preset.view] : viewDirection, distance)
    if (camera instanceof OrthographicCamera) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
    orbit.update()
    orbit.saveState()

    if (previous?.framing === framing && previous.preset === preset) {
      camera.position.copy(previous.position)
      camera.zoom = previous.zoom
      camera.updateProjectionMatrix()
      orbit.update()
    }
    invalidate()

    return () => {
      savedCamera.current = { position: camera.position.clone(), zoom: camera.zoom, framing, preset }
    }
  }, [camera, controls, distance, framing, halfHeight, invalidate, minZ, preset, savedCamera, zoom])

  return <OrbitControls
    ref={controls}
    enableDamping={false}
    enablePan={false}
    minDistance={boundingRadius * 0.65}
    maxDistance={distance * 2}
    minZoom={zoom / 2}
    maxZoom={zoom * 4}
  />
}

export function ScatterPlot3D({ points, radius = 3, surface, progress = 1, selectedId, onSelect, tiltedPlane, planeHeight, minimumPlaneHeight, maximumPlaneHeight, intersection, water, showCameraPresets = false }: {
  points: readonly DataPoint3D[]
  radius?: number
  surface?: FeatureSurfaceData
  planeHeight?: number
  tiltedPlane?: FeaturePlane
  minimumPlaneHeight?: number
  maximumPlaneHeight?: number
  intersection?: readonly Coordinates3D[]
  water?: { height: number; radius: number | null }
  showCameraPresets?: boolean
  progress?: number
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const savedCamera = useRef<CameraSnapshot>()
  const viewport = useRef<HTMLDivElement>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    const element = viewport.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setNearViewport(entry.isIntersecting)
    }, { rootMargin: '240px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const [preset, setPreset] = useState<{ view: CameraPreset }>({ view: 'Perspective' })
  const minZ = points.reduce((min, point) => Math.min(min, point.z), Math.min(water?.height ?? 0, planeHeight ?? 0, minimumPlaneHeight ?? 0, surface?.minZ ?? 0))
  const maxZ = points.reduce((max, point) => Math.max(max, point.z), Math.max(3, surface?.maxZ ?? 0, planeHeight ?? 0, maximumPlaneHeight ?? 0, water?.height ?? 0))

  return <>
    <div ref={viewport} className="scatter-3d" role="group" aria-label="3D scatter plot with x₁, x₂, and z axes">
      {nearViewport && <Canvas
        flat
        frameloop="demand"
        orthographic={showCameraPresets}
        camera={showCameraPresets ? undefined : { fov: fieldOfView }}
        fallback={<p>WebGL is required for the interactive 3D view.</p>}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 8, 3]} intensity={2.1} />
        <CoordinateAxes3D radius={radius} minZ={minZ} maxZ={maxZ} />
        {surface && <FeatureSurface3D surface={surface} progress={progress} />}
        {planeHeight !== undefined && <SeparatingPlane3D height={planeHeight} radius={radius} />}
        {tiltedPlane && <TiltedPlane3D plane={tiltedPlane} radius={radius} />}
        {water && water.radius !== null && water.radius > 0 &&
          <WaterSurface3D height={water.height} radius={water.radius} />}
        {intersection && <IntersectionCurve3D points={intersection} />}
        {points.map(point => {
          const selected = point.id === selectedId
          return <group key={point.id} position={toWorldPosition(observationAtProgress(point, progress))}>
            <mesh renderOrder={2} scale={selected ? 1.5 : 1} onClick={onSelect && (event => {
              if (event.delta > 3) return
              event.stopPropagation()
              onSelect(point.id)
            })}>
              <sphereGeometry args={markerSize} />
              {/* Draw markers after the translucent surface to preserve their class colors. */}
              <meshBasicMaterial color={classColors[point.label]} transparent />
            </mesh>
            {selected && <mesh renderOrder={1} scale={1.85}>
              <sphereGeometry args={markerSize} />
              <meshBasicMaterial color="#20252b" side={BackSide} transparent />
            </mesh>}
          </group>
        })}
        <PlotCamera controls={controls} savedCamera={savedCamera} radius={radius} minZ={minZ} maxZ={maxZ}
          preset={showCameraPresets ? preset : undefined} />
      </Canvas>}
    </div>
    {showCameraPresets && <div className="camera-actions" role="group" aria-label="Camera presets">
      {(Object.keys(cameraPresets) as CameraPreset[]).map(view =>
        <button key={view} type="button" onClick={() => setPreset({ view })}>{view}</button>)}
    </div>}
    <div className="camera-actions">
      <button type="button" onClick={() => controls.current?.reset()}>Reset Camera</button>
      <span className="hint">Drag to rotate. Scroll or pinch to zoom.</span>
    </div>
  </>
}

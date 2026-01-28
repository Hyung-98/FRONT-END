'use client'

import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Three.js 기본 사용법 데모
 *
 * 1. Scene(씬) – 3D 공간 컨테이너
 * 2. Camera(카메라) – PerspectiveCamera로 시점 설정
 * 3. Renderer(렌더러) – WebGLRenderer로 canvas에 그림
 * 4. Mesh(메시) – Geometry + Material 조합
 * 5. Light(조명) – AmbientLight, DirectionalLight 등
 *
 * Next.js에서는 반드시 'use client' + 동적 로딩(ssr: false)으로 사용합니다.
 */
export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    const init = async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      const el = containerRef.current!
      const width = el.clientWidth
      const height = el.clientHeight

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0f172a)

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
      camera.position.set(0, 0, 5)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      el.appendChild(renderer.domElement)

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.3,
        roughness: 0.5,
      })
      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      const ambient = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambient)
      const directional = new THREE.DirectionalLight(0xffffff, 0.8)
      directional.position.set(2, 5, 3)
      scene.add(directional)

      const controls = new OrbitControls(camera, renderer.domElement) as OrbitControlsType
      controls.enableDamping = true
      controls.dampingFactor = 0.05

      const onResize = () => {
        if (!containerRef.current) return
        const w = containerRef.current.clientWidth
        const h = containerRef.current.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      let animationId: number
      const animate = () => {
        animationId = requestAnimationFrame(animate)
        cube.rotation.y += 0.005
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('resize', onResize)
        cancelAnimationFrame(animationId)
        renderer.dispose()
        if (el.contains(renderer.domElement)) {
          el.removeChild(renderer.domElement)
        }
      }
    }

    const promise = init()

    return () => {
      promise.then(d => typeof d === 'function' && d())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0f172a',
      }}
      aria-hidden
    />
  )
}
